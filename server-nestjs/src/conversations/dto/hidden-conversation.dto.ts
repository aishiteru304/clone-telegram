import { IsNotEmpty } from 'class-validator';

export class HiddenConversationDto {
    @IsNotEmpty()
    accessToken: string;

    @IsNotEmpty()
    conversationId: string;
}