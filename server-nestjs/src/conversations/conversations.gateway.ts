import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { FriendService } from 'src/friend/friend.service';
import { FriendRequestDto } from 'src/friend/dto/friend-request.dto';
import { UserService } from 'src/user/user.service';
import { ConversationsService } from './conversations.service';
import { MessageService } from 'src/message/message.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { NotificationService } from 'src/notification/notification.service';
import { SeenMessageDto } from 'src/message/dto/seen-message.dto';

@WebSocketGateway({ cors: true })
export class ConversationsGateway {

  @WebSocketServer() server: Server;
  private connectedUsers: Map<string, string> = new Map(); // Map client.id -> userId

  constructor(private readonly userService: UserService,
    private readonly friendService: FriendService,
    private readonly conversationsService: ConversationsService,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService
  ) { }

  //.....................................................Connecting...................................................................
  async handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;

    if (!userId) {
      console.log('No userId provided');
      client.disconnect(); // Ngắt kết nối nếu không có userId
      return;
    }

    // console.log(`Client connected: ${client.id}, UserId: ${userId}`);
    this.connectedUsers.set(client.id, userId);
    // Gửi thông tin trạng thái online cho tất cả client khác
    this.emitUserOnlineStatus(userId, true);
  }

  //.....................................................Friends...................................................................

  // Hàm gửi lời mời kết bạn
  @SubscribeMessage('addFriendRequest')
  async handleAddFriendRequest(@MessageBody() friendRequestDto: FriendRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const response = await this.friendService.addFriendRequest(friendRequestDto);
      if (response.statusCode == 200) {

        // Tìm socketId của senderId
        const socketId = [...this.connectedUsers.entries()].find(
          ([_, userId]) => userId == friendRequestDto.userId,
        )?.[0];

        const receiver = await this.userService.getInformationById(friendRequestDto.userId)
        const sender = await this.userService.getInformationById(this.connectedUsers.get(client.id))
        const newRequestNotification = await this.notificationService.newNotificationRequest(friendRequestDto.userId)

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: true, isReceiverRequest: false, noRelationship: false });
        client.emit("newRequestSent", sender)

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: true,
          noRelationship: false,
        });
        // Gửi danh sách lời mời mới về
        this.server.to(socketId).emit('newRequestFriend', receiver);
        this.server.to(socketId).emit('newRequestNotification', newRequestNotification);
      }
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  // Hàm hủy lời mời kết bạn
  @SubscribeMessage('deleteFriendRequest')
  async handleDeleteFriendRequest(@MessageBody() friendRequestDto: FriendRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const response = await this.friendService.deleteFriendRequest(friendRequestDto);
      if (response.statusCode == 200) {

        // Tìm socketId của senderId
        const socketId = [...this.connectedUsers.entries()].find(
          ([_, userId]) => userId == friendRequestDto.userId,
        )?.[0];

        const sender = await this.userService.getInformationById(this.connectedUsers.get(client.id))
        const receiver = await this.userService.getInformationById(friendRequestDto.userId)
        const newRequestNotification = await this.notificationService.cancelNotificationRequest(friendRequestDto.userId)

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true });
        client.emit("newRequestSent", sender)

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: true,
        });
        // Gửi danh sách lời mời mới về
        this.server.to(socketId).emit('newRequestFriend', receiver);
        this.server.to(socketId).emit('newRequestNotification', newRequestNotification);

      }
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  // Hàm từ chối lời mời kết bạn
  @SubscribeMessage('rejectFriendRequest')
  async handleRejectFriendRequest(@MessageBody() friendRequestDto: FriendRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const response = await this.friendService.rejectFriendRequest(friendRequestDto);
      if (response.statusCode == 200) {

        // Tìm socketId của senderId
        const socketId = [...this.connectedUsers.entries()].find(
          ([_, userId]) => userId == friendRequestDto.userId,
        )?.[0];

        const sender = await this.userService.getInformationById(this.connectedUsers.get(client.id))
        const receiver = await this.userService.getInformationById(friendRequestDto.userId)

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true });
        client.emit("newRequestFriend", sender)

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: true,
        });
        this.server.to(socketId).emit('newRequestSent', receiver);

      }
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  // Hàm chấp nhận lời mời kết bạn
  @SubscribeMessage('acceptFriendRequest')
  async handleAcceptFriendRequest(@MessageBody() friendRequestDto: FriendRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const response = await this.friendService.acceptFriendRequest(friendRequestDto);
      if (response.statusCode == 200) {

        // Tìm socketId của senderId
        const socketId = [...this.connectedUsers.entries()].find(
          ([_, userId]) => userId == friendRequestDto.userId,
        )?.[0];

        const sender = await this.userService.getInformationById(this.connectedUsers.get(client.id))
        const receiver = await this.userService.getInformationById(friendRequestDto.userId)
        await this.conversationsService.createConversation({ userIds: [friendRequestDto.userId, this.connectedUsers.get(client.id)] })

        // Cập nhật lại conversations
        const conversations = await this.conversationsService.handleChangeConversation(this.connectedUsers.get(client.id), friendRequestDto.userId)

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: true, isSendRequest: false, isReceiverRequest: false, noRelationship: false });
        client.emit('friendsList', sender);
        client.emit("newRequestFriend", sender);
        client.emit("updateConversations", conversations.conversationsSender)

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: true,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: false,
        });
        this.server.to(socketId).emit('friendsList', receiver);
        this.server.to(socketId).emit('newRequestSent', receiver);
        this.server.to(socketId).emit("updateConversations", conversations.conversationsReceiver)

      }
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  // Hàm xóa bạn
  @SubscribeMessage('deleteFriend')
  async handleDeleteFriend(@MessageBody() friendRequestDto: FriendRequestDto, @ConnectedSocket() client: Socket) {
    try {
      const response = await this.friendService.deleteFriend(friendRequestDto);
      if (response.statusCode == 200) {

        // Tìm socketId của senderId
        const socketId = [...this.connectedUsers.entries()].find(
          ([_, userId]) => userId == friendRequestDto.userId,
        )?.[0];


        await this.conversationsService.blockConversation({ userIds: [friendRequestDto.userId, this.connectedUsers.get(client.id)] })
        const sender = await this.userService.getInformationById(this.connectedUsers.get(client.id))
        const receiver = await this.userService.getInformationById(friendRequestDto.userId)

        // Cập nhật lại conversations
        const conversations = await this.conversationsService.handleChangeConversation(this.connectedUsers.get(client.id), friendRequestDto.userId)
        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true });
        client.emit('friendsList', sender);
        client.emit("changedFriend", true)
        client.emit("updateConversations", conversations.conversationsSender)

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: true,
        });

        this.server.to(socketId).emit('friendsList', receiver);
        client.emit("changedFriend", true)
        this.server.to(socketId).emit("updateConversations", conversations.conversationsReceiver)

      }
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  //.....................................................Notification...................................................................
  @SubscribeMessage('seenFriendRequest')
  async handleSeenFriendRequest(@ConnectedSocket() client: Socket) {
    try {

      const newRequestNotification = await this.notificationService.seenNotificationRequest(this.connectedUsers.get(client.id))
      // Phát lại phản hồi tới client
      client.emit('newRequestNotification', newRequestNotification);

    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  //.....................................................Message...................................................................

  // Hàm create message
  @SubscribeMessage('createMessage')
  async createMessage(@MessageBody() createMessageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    try {
      const newMessages = await this.messageService.createMessage(createMessageDto);
      const conversationSender = await this.conversationsService.getConversationListByUserId(this.connectedUsers.get(client.id))
      // Sử dụng Promise.all để lấy conversationReceiver cho tất cả userIds
      const conversationReceivers = await Promise.all(
        createMessageDto.receiverIds.map(userId => this.conversationsService.getConversationListByUserId(userId))
      );

      const notificationConversationSender = await this.notificationService.getNotificationsConversationById(this.connectedUsers.get(client.id))
      const notificationsConversation = await Promise.all(
        createMessageDto.receiverIds.map(userId => this.notificationService.getNotificationsConversationById(userId))
      );

      const socketIds = await this.findClientIds(createMessageDto.receiverIds)

      // Gửi phản hồi về client
      client.emit('newMessage', { conversationId: createMessageDto.conversationId, newMessages });
      client.emit("updateConversations", conversationSender)
      client.emit('updateNotificationsConversation', notificationConversationSender);

      // Gửi tin nhắn đến từng socketId
      socketIds.forEach((socketId, index) => {
        this.server.to(socketId).emit('newMessage', { conversationId: createMessageDto.conversationId, newMessages });
        this.server.to(socketId).emit('updateConversations', conversationReceivers[index]);
        this.server.to(socketId).emit('updateNotificationsConversation', notificationsConversation[index]);
      });

    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }


  // Hàm seenMessage message
  @SubscribeMessage('seenMessage')
  async seenMessage(@MessageBody() seenMessageDto: SeenMessageDto, @ConnectedSocket() client: Socket) {
    try {
      const messages = await this.messageService.seenMessage(seenMessageDto);
      const receiverIds = messages.members.map((item: any) => item._id.toString())
      const socketIds = await this.findClientIds(receiverIds)

      const notificationConversationSender = await this.notificationService.getNotificationsConversationById(this.connectedUsers.get(client.id))

      // Gửi tin nhắn đến từng socketId
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('newMessage', { conversationId: seenMessageDto.conversationId, newMessages: messages });
      });
      client.emit('updateNotificationsConversation', notificationConversationSender);

    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  //.....................................................Online/Offline...................................................................

  // Hàm kiểm tra user có online không
  @SubscribeMessage('isUserOnline')
  handleIsUserOnline(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    const isOnline = Array.from(this.connectedUsers.values()).includes(userId);
    // Gửi phản hồi về client
    client.emit('userOnlineStatus', { userId, isOnline });
  }

  // Phát sự kiện trạng thái người dùng online/offline cho tất cả client
  emitUserOnlineStatus(userId: string, isOnline: boolean) {
    // Phát sự kiện cho tất cả client để thông báo trạng thái của user
    this.server.emit('userOnlineStatus', { userId, isOnline });
  }

  //.....................................................Support function...................................................................

  // Lọc các clientId từ Map dựa trên receiverIds
  async findClientIds(receiverIds: string[]) {
    const clientIds = [...this.connectedUsers.entries()]
      .filter(([_, userId]) => receiverIds.includes(userId))
      .map(([clientId]) => clientId);

    return clientIds;
  }

  //.....................................................Disconnecting...................................................................
  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      // console.log(`Client disconnected: ${client.id}, UserId: ${userId}`);
      this.connectedUsers.delete(client.id);
    }
  }
}



