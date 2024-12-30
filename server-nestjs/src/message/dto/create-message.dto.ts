import { Optional } from '@nestjs/common';
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

    @Optional()
    message: string;

    @Optional()
    file: string;

}