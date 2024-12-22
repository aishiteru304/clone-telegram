import { IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
    @IsNotEmpty()
    userIds: string[];
}