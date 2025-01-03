import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { NotificationModule } from 'src/notification/notification.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    JwtModule,
    ConversationsModule,
    NotificationModule
  ],
  providers: [MessageService, CloudinaryService],
  exports: [MessageService]
})
export class MessageModule { }
