import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Conversation } from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
    ) { }

    async createConversation(createConversationDto: CreateConversationDto) {

        try {
            // Lấy dữ liệu từ body
            const { userIds } = createConversationDto;
            // Kiểm tra các userIds có tồn tại trong database
            const users = await this.userModel.find({ _id: { $in: userIds } });

            if (users.length !== userIds.length) {
                throw new HttpException('One or more users do not exist', HttpStatus.BAD_REQUEST);
            }

            // Kiểm tra xem đã có conversation với các userIds này chưa
            const existingConversation = await this.conversationModel.findOne({
                members: { $all: userIds }, // Kiểm tra members chứa tất cả userIds
                $expr: { $eq: [{ $size: "$members" }, userIds.length] }, // Kiểm tra độ dài members
            });


            if (existingConversation) {
                existingConversation.isBlock = false
                await existingConversation.save()
                return {
                    statusCode: HttpStatus.CREATED,
                };
            }

            // Tạo mới conversation nếu tất cả userIds tồn tại
            const conversation = new this.conversationModel({
                members: userIds,
            });

            await conversation.save();

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.CREATED,
            };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async blockConversation(createConversationDto: CreateConversationDto) {

        try {
            // Lấy dữ liệu từ body
            const { userIds } = createConversationDto;
            // Kiểm tra các userIds có tồn tại trong database
            const users = await this.userModel.find({ _id: { $in: userIds } });

            if (users.length !== userIds.length) {
                throw new HttpException('One or more users do not exist', HttpStatus.BAD_REQUEST);
            }

            // Kiểm tra xem đã có conversation với các userIds này chưa
            const existingConversation = await this.conversationModel.findOne({
                members: { $all: userIds }, // Kiểm tra members chứa tất cả userIds
                $expr: { $eq: [{ $size: "$members" }, userIds.length] }, // Kiểm tra độ dài members
            });


            if (!existingConversation) {
                throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);
            }

            existingConversation.isBlock = true
            await existingConversation.save()
            return {
                statusCode: HttpStatus.OK,
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
