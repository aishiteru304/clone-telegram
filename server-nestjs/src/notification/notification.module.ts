import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notify, NotifySchema } from './schemas/notifycation.schema';
import { NotificationController } from './notification.controller';
import { JwtAuthUserMiddleware } from 'src/middlewares/authUser';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notify.name, schema: NotifySchema }]),
  ],
  providers: [NotificationService],
  exports: [
    NotificationService,
    MongooseModule
  ],
  controllers: [NotificationController]
})
export class NotificationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthUserMiddleware)
      .forRoutes(
        { path: 'notification', method: RequestMethod.GET },
      );
  }
}
