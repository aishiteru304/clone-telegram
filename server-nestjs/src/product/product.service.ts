import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {

    constructor(@InjectModel(Product.name) private productModel: Model<Product>, private readonly cloudinaryService: CloudinaryService) { }

    async createProduct(createProductDto: CreateProductDto) {
        try {
            // Lấy dữ liệu từ body
            // const { name, price } = createProductrDto;

            // // Kiểm tra email đã tồn tại chưa
            // const existingUser = await this.userModel.findOne({ email });
            // if (existingUser) {
            //     throw new HttpException('Email already exists', HttpStatus.UNAUTHORIZED);
            // }

            // Upload file lên Cloudinary và lấy URL
            const fileUrl = await this.cloudinaryService.uploadFile(createProductDto.file);
            console.log(fileUrl)

            // // Tạo người dùng mới
            // const newUser = new this.userModel({
            //     fullName,
            //     email,
            //     password: hashedPassword, // Lưu mật khẩu đã được hash
            // });

            // Lưu vào cơ sở dữ liệu
            // await newUser.save();

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.CREATED,
                message: 'Product created successfully.',
            };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
