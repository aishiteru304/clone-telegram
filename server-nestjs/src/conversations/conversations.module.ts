import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { UserModule } from 'src/user/user.module';
import { ConversationsController } from './conversations.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthUserMiddleware } from 'src/middlewares/authUser';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
    UserModule,
    JwtModule
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService, MongooseModule]
})
export class ConversationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthUserMiddleware)
      .forRoutes(
        { path: 'conversations/:id', method: RequestMethod.GET },
        { path: 'conversations', method: RequestMethod.GET },
        { path: 'conversations/members', method: RequestMethod.POST },
      );
  }
}
