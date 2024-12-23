import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Conversation } from './schemas/conversation.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ConversationsService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        private readonly jwtService: JwtService
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

    async getConversations(accessToken: string) {
        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });

            // Truy vấn conversation từ cơ sở dữ liệu và populate trường 'friends'
            const conversations = await this.conversationModel.find({
                members: decoded.id,// Điều kiện members chứa userId
                isBlock: false,
            })
                .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật mới nhất
                .populate('members') // Populate thông tin của members
                .exec();


            if (!conversations) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return conversations;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            // Xử lý lỗi JWT cụ thể (nếu cần)
            if (error.name === 'TokenExpiredError') {
                throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
            }

            if (error.name === 'JsonWebTokenError') {
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getConversationById(id: string) {
        try {

            // Truy vấn conversation từ cơ sở dữ liệu và populate trường 'friends'
            const conversation = await this.conversationModel.findOne({
                _id: id, // id cần tìm
                isBlock: false,     // điều kiện bổ sung
            })
                .populate('members', "fullName") // Populate thông tin của members
                .exec();


            if (!conversation) {
                throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
            }

            return conversation;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            // Xử lý lỗi JWT cụ thể (nếu cần)
            if (error.name === 'TokenExpiredError') {
                throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
            }

            if (error.name === 'JsonWebTokenError') {
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async handleChangeConversation(senderId: string, receiverId: string) {
        try {

            // Truy vấn conversation từ cơ sở dữ liệu và populate trường 'friends'
            const conversationsSender = await this.conversationModel.find({
                members: senderId,// Điều kiện members chứa userId
                isBlock: false,
            })
                .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật mới nhất
                .populate('members') // Populate thông tin của members
                .exec();

            const conversationsReceiver = await this.conversationModel.find({
                members: receiverId,// Điều kiện members chứa userId
                isBlock: false,
            })
                .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật mới nhất
                .populate('members') // Populate thông tin của members
                .exec();


            if (!conversationsSender || !conversationsReceiver) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return { conversationsReceiver, conversationsSender };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}