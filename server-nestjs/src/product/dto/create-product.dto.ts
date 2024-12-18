import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    file: Express.Multer.File; // File upload

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    price: string;

}
