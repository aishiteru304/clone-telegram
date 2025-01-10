import { IsArray, ArrayUnique, IsString, IsNotEmpty } from 'class-validator';

export class CreateGroupDto {
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    phones: string[];

    @IsNotEmpty()
    accessToken: string;
}
