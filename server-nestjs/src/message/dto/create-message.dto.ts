import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
    @IsNotEmpty()
    conversationId: string;

    @IsNotEmpty()
    accessToken: string;

    @IsNotEmpty()
    receiverIds: string[];

    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    message: string;

}