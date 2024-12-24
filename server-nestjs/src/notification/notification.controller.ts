import { Controller, Get, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notification: NotificationService) { }

    @Get()
    async getNotification(@Req() req: Request) {
        return this.notification.getNotification(req);
    }
}
