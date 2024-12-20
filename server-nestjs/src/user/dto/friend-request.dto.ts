import { IsNotEmpty } from 'class-validator';

export class FriendRequestDto {

    @IsNotEmpty()
    userId: string;

}