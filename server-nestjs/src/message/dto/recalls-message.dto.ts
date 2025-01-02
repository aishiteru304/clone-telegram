import { IsNotEmpty } from 'class-validator';

export class RecallsMessageDto {
    @IsNotEmpty()
    messageId: string;

    @IsNotEmpty()
    accessToken: string;
}