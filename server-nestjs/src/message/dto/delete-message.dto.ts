import { IsNotEmpty } from 'class-validator';

export class DeleteMessageDto {
    @IsNotEmpty()
    accessToken: string;

    @IsNotEmpty()
    conversationId: string;
}