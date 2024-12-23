import { Controller, Get, Param } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationService: ConversationsService) { }

    @Get(":id")
    async getConversationById(@Param("id") id: string) {
        return this.conversationService.getConversationById(id);
    }

}
