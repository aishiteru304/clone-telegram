import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notify } from './schemas/notifycation.schema';
import { createNotifyDto } from './dto/create-notify.dto';

@Injectable()
export class NotificationService {

    constructor(@InjectModel(Notify.name) private notifyModel: Model<Notify>) { }

    async createNofity(createNofityDto: createNotifyDto) {
        try {
            // Lấy dữ liệu từ body
            const { userId } = createNofityDto;

            // Tạo người dùng mới
            const newNotify = new this.notifyModel({
                user: userId
            });

            // Lưu vào cơ sở dữ liệu
            await newNotify.save();

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.CREATED,
                message: 'User registered successfully.',
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
