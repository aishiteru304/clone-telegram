import { IsNotEmpty } from 'class-validator';

export class SeenMessageDto {
    @IsNotEmpty()
    conversationId: string;

    @IsNotEmpty()
    accessToken: string;
}