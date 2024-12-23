import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from 'src/conversations/schemas/conversation.schema';
import { Message } from './schemas/message.schema';

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        private readonly jwtService: JwtService
    ) { }
    async createMessage(createMessageDto: CreateMessageDto) {
        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(createMessageDto.accessToken, { secret: process.env.JWT_SECRET });

            // Kiểm tra có conversationId hay không
            const userIds = [...createMessageDto.receiverIds, decoded.id]
            const conversation = await this.conversationModel.findOne({
                _id: createMessageDto.conversationId,
                members: { $all: userIds }, // Kiểm tra members chứa tất cả userIds
                $expr: { $eq: [{ $size: "$members" }, userIds.length] }, // Kiểm tra độ dài members
            });

            if (!conversation) {
                throw new HttpException('Conversation does not exist', HttpStatus.NOT_FOUND);
            }

            const newMessage = await this.messageModel.create({
                sender: decoded.id,
                conversationId: createMessageDto.conversationId,
                type: createMessageDto.type,
                receiver: createMessageDto.receiverIds,
                message: createMessageDto.message
            });

            conversation.amountMessages += 1
            await conversation.save()

            return newMessage

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
}
