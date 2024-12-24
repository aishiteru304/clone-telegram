import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConversationsGateway } from './conversations/conversations.gateway';
import { FriendModule } from './friend/friend.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    UserModule,
    CloudinaryModule,
    FriendModule,
    ConversationsModule,
    MessageModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConversationsGateway],
})
export class AppModule { }
