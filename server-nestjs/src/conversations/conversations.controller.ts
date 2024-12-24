import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationService: ConversationsService) { }

    @Get(":id")
    async getConversationById(@Param("id") id: string) {
        return this.conversationService.getConversationById(id);
    }

    @Get()
    async getConversations(@Req() req: Request) {
        return this.conversationService.getConversations(req);
    }

    @Post("members")
    async getConversationByMembers(@Req() req: Request, @Body() receiverIds: CreateConversationDto) {
        return this.conversationService.getConversationByMembers(req, receiverIds);
    }

}
