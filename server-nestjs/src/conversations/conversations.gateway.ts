import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
export class ConversationsGateway {

  @WebSocketServer() server: Server;
  private connectedUsers: Map<string, string> = new Map(); // Map client.id -> userId

  constructor(private readonly userService: UserService) { }

  async handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;

    if (!userId) {
      console.log('No userId provided');
      client.disconnect(); // Ngắt kết nối nếu không có userId
      return;
    }

    console.log(`Client connected: ${client.id}, UserId: ${userId}`);
    this.connectedUsers.set(client.id, userId);
    // Gửi thông tin trạng thái online cho tất cả client khác
    this.emitUserOnlineStatus(userId, true);
  }

  // Hàm lấy danh sách bạn bè
  @SubscribeMessage('getFriends')
  async handleGetFriends(@MessageBody() accessToken: string, @ConnectedSocket() client: Socket) {
    try {
      // Lấy danh sách bạn bè từ UserService
      const friends = await this.userService.getFriends(accessToken);

      // Gửi danh sách bạn bè cho client
      client.emit('friendsList', friends);
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
      console.log(`Client disconnected: ${client.id}, UserId: ${userId}`);
      this.connectedUsers.delete(client.id);
    }
  }
}

