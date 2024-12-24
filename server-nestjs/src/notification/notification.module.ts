import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notify, NotifySchema } from './schemas/notifycation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notify.name, schema: NotifySchema }]),
  ],
  providers: [NotificationService],
  exports: [
    NotificationService
  ]
})
export class NotificationModule { }
