import { IsNotEmpty } from 'class-validator';

export class createNotifyDto {
    @IsNotEmpty()
    userId: string;
}