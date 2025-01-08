import { IsArray, ArrayUnique, IsString } from 'class-validator';

export class CreateGroupDto {
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    phones: string[];
}
