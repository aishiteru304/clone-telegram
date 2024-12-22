import { Body, Controller, Post } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationService: ConversationsService) { }

    @Post()
    async register(@Body() createConversationDto: CreateConversationDto) {
        return this.conversationService.createConversation(createConversationDto);
    }

}
