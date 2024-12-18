import { Body, Controller, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FormDataRequest } from 'nestjs-form-data';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('')
    @FormDataRequest()
    async createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto);
    }
}
