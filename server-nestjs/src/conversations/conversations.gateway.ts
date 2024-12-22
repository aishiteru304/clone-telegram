import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { FriendService } from 'src/friend/friend.service';
import { FriendRequestDto } from 'src/friend/dto/friend-request.dto';
import { UserService } from 'src/user/user.service';
import { ConversationsService } from './conversations.service';

@WebSocketGateway({ cors: true })
export class ConversationsGateway {

  @WebSocketServer() server: Server;
  private connectedUsers: Map<string, string> = new Map(); // Map client.id -> userId

  constructor(private readonly userService: UserService,
    private readonly friendService: FriendService,
    private readonly conversationsService: ConversationsService
  ) { }

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

  // Hàm lấy danh sách bạn bè
  @SubscribeMessage('getFriends')
  async handleGetFriends(@MessageBody() accessToken: string, @ConnectedSocket() client: Socket) {
    try {
      // Lấy danh sách bạn bè từ UserService
      const friends = await this.friendService.getFriends(accessToken);

      // Gửi danh sách bạn bè cho client
      client.emit('friendsList', friends);
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

  // Hàm lấy danh sách lời mời kết bạn
  @SubscribeMessage('getFriendsRequest')
  async handleGetFriendsRequest(@MessageBody() accessToken: string, @ConnectedSocket() client: Socket) {
    try {
      // Lấy danh sách lời mời từ UserService
      const friendsRequest = await this.friendService.getFriendsRequest(accessToken);

      // Gửi danh sách lời mời cho client
      client.emit('friendsRequestList', friendsRequest);
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

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

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: true, isReceiverRequest: false, noRelationship: false });

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

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true });
        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: true,
        });

        const receiver = await this.userService.getInformationById(friendRequestDto.userId)
        // Gửi danh sách lời mời mới về
        this.server.to(socketId).emit('newRequestFriend', receiver);
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

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true });
        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: true,
        });

        await this.handleGetFriendsRequest(friendRequestDto.accessToken, client)
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

        await this.handleGetFriendsRequest(friendRequestDto.accessToken, client)
        const friendsSender = await this.friendService.getFriendsById(friendRequestDto.userId)
        const friendsAccepter = await this.friendService.getFriendsById(this.connectedUsers.get(client.id))
        await this.conversationsService.createConversation({ userIds: [friendRequestDto.userId, this.connectedUsers.get(client.id)] })

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: true, isSendRequest: false, isReceiverRequest: false, noRelationship: false });
        client.emit('friendsList', friendsAccepter);

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: true,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: false,
        });
        this.server.to(socketId).emit('friendsList', friendsSender);
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
        await this.handleGetFriendsRequest(friendRequestDto.accessToken, client)
        const friendsSender = await this.friendService.getFriendsById(friendRequestDto.userId)
        const friendsAccepter = await this.friendService.getFriendsById(this.connectedUsers.get(client.id))

        // Phát lại phản hồi tới client
        client.emit('relationship', { userId: friendRequestDto.userId, isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true });
        client.emit('friendsList', friendsAccepter);

        // Gửi sự kiện tới client cụ thể
        this.server.to(socketId).emit('relationship', {
          userId: this.connectedUsers.get(client.id),
          isFriend: false,
          isSendRequest: false,
          isReceiverRequest: false,
          noRelationship: true,
        });

        this.server.to(socketId).emit('friendsList', friendsSender);

      }
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', error);

    }
  }

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

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      // console.log(`Client disconnected: ${client.id}, UserId: ${userId}`);
      this.connectedUsers.delete(client.id);
    }
  }
}



