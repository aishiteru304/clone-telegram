import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
export class FriendsGateway {

  @WebSocketServer() server: Server;

  constructor(private readonly userService: UserService) { }

  @SubscribeMessage('getFriends')
  async handleGetFriends(@MessageBody() accessToken: string, @ConnectedSocket() client: Socket) {
    try {
      // Lấy danh sách bạn bè từ UserService
      const friends = await this.userService.getFriends(accessToken);

      // Gửi danh sách bạn bè cho client
      client.emit('friendsList', friends);
    } catch (error) {
      // Xử lý lỗi nếu có
      client.emit('error', { message: 'Error fetching friends' });
    }
  }

}
