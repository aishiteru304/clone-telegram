import { IsNotEmpty } from 'class-validator';

export class AddFriendDto {

    @IsNotEmpty()
    userId: string;

}