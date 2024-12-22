import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { UserModule } from 'src/user/user.module';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
    UserModule
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService]
})
export class ConversationsModule { }
