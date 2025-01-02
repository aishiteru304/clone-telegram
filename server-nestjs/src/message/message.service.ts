import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from 'src/conversations/schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { SeenMessageDto } from './dto/seen-message.dto';
import { ConversationsService } from 'src/conversations/conversations.service';
import { Notify } from 'src/notification/schemas/notifycation.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TypeMessage } from 'src/enums/type-message.enum';
import { RecallsMessageDto } from './dto/recalls-message.dto';

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        @InjectModel(Notify.name) private readonly notifyModel: Model<Notify>,
        private readonly conversationService: ConversationsService,
        private readonly jwtService: JwtService,
        private readonly cloudinaryService: CloudinaryService
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

            // Seen tin nhắn cũ
            await this.messageModel.updateMany(
                {
                    sender: { $ne: decoded.id } // Tìm tất cả message mà sender không bằng decoded.id
                },
                {
                    $addToSet: { seen: decoded.id } // Thêm decoded.id vào mảng seen nếu chưa tồn tại
                }
            );

            // Delete hidden conversation
            await this.conversationModel.updateOne(
                { _id: conversation._id }, // Find the document by its ID
                { $set: { hidden: [] } } // Set `hidden` to an empty array
            );

            if (createMessageDto.type == TypeMessage.TEXT) {
                const newMessage = await this.messageModel.create({
                    sender: decoded.id,
                    conversationId: createMessageDto.conversationId,
                    type: createMessageDto.type,
                    receiver: createMessageDto.receiverIds,
                    message: createMessageDto.message
                });

                conversation.messages.unshift(newMessage)
                await conversation.save()
            }

            // Upload ảnh
            if (createMessageDto.type == TypeMessage.IMAGE) {
                const base64Data = createMessageDto.file.split(';base64,').pop();
                const fileUrl = await this.cloudinaryService.uploadFile(base64Data, "image");

                const newMessage = await this.messageModel.create({
                    sender: decoded.id,
                    conversationId: createMessageDto.conversationId,
                    type: createMessageDto.type,
                    receiver: createMessageDto.receiverIds,
                    message: fileUrl.url
                });

                conversation.messages.unshift(newMessage)
                await conversation.save()
            }

            // Upload video 
            if (createMessageDto.type == TypeMessage.VIDEO) {
                const base64Data = createMessageDto.file.split(';base64,').pop();
                const fileUrl = await this.cloudinaryService.uploadFile(base64Data, "video");

                const newMessage = await this.messageModel.create({
                    sender: decoded.id,
                    conversationId: createMessageDto.conversationId,
                    type: createMessageDto.type,
                    receiver: createMessageDto.receiverIds,
                    message: fileUrl.url
                });

                conversation.messages.unshift(newMessage)
                await conversation.save()
            }

            // Thêm thông báo 
            for (const receiverId of createMessageDto.receiverIds) {
                await this.notifyModel.updateOne(
                    { user: receiverId }, // Điều kiện để tìm Notify của user
                    { $addToSet: { conversation: createMessageDto.conversationId } } // Chỉ thêm nếu chưa tồn tại
                );
            }

            // Xóa thông báo 
            await this.notifyModel.updateOne(
                { user: decoded.id }, // Điều kiện để tìm Notify của user
                { $pull: { conversation: createMessageDto.conversationId } } // Xóa conversationId khỏi mảng
            );

            // Truy vấn conversation từ cơ sở dữ liệu và populate trường 'friends'
            const messages = await this.conversationModel.findOne({
                _id: createMessageDto.conversationId,
                isBlock: false,     // điều kiện bổ sung
            })
                .populate({
                    path: 'messages', // Populate messages
                    options: { sort: { createdAt: -1 } }, // Sắp xếp mới trước
                    populate: [
                        { path: 'sender', select: 'fullName type' }, // Populate sender bên trong messages
                        { path: 'receiver', select: 'fullName type' }, // Populate receiver bên trong messages
                        { path: 'conversationId', select: 'members' }, // Populate receiver bên trong messages
                    ],
                })
                .exec();

            return messages

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

    async seenMessage(seenMessageDto: SeenMessageDto) {
        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(seenMessageDto.accessToken, { secret: process.env.JWT_SECRET });

            // Xóa thông báo 
            await this.notifyModel.updateOne(
                { user: decoded.id }, // Điều kiện để tìm Notify của user
                { $pull: { conversation: seenMessageDto.conversationId } } // Xóa conversationId khỏi mảng
            );

            // Seen tin nhắn cũ
            await this.messageModel.updateMany(
                {
                    sender: { $ne: decoded.id } // Tìm tất cả message mà sender không bằng decoded.id
                },
                {
                    $addToSet: { seen: decoded.id } // Thêm decoded.id vào mảng seen nếu chưa tồn tại
                }
            );

            // Truy vấn conversation từ cơ sở dữ liệu và populate message
            const messages = await this.conversationModel.findOne({
                _id: seenMessageDto.conversationId,
                isBlock: false,     // điều kiện bổ sung
            })
                .populate({
                    path: 'messages', // Populate messages
                    options: { sort: { createdAt: -1 } }, // Sắp xếp mới trước
                    populate: [
                        { path: 'sender', select: 'fullName type' }, // Populate sender bên trong messages
                        { path: 'receiver', select: 'fullName type' }, // Populate receiver bên trong messages
                        { path: 'conversationId', select: 'members' }, // Populate receiver bên trong messages
                    ],
                })
                .exec();

            return messages

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

    async recallsMessage(recallsMessageDto: RecallsMessageDto) {
        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(recallsMessageDto.accessToken, { secret: process.env.JWT_SECRET });

            const message = await this.messageModel.findOne({
                _id: recallsMessageDto.messageId,
                sender: decoded.id
            })

            if (!message) {
                throw new HttpException('Message does not exist', HttpStatus.NOT_FOUND);
            }
            message.message = ""
            await message.save()

            // Truy vấn conversation từ cơ sở dữ liệu và populate message
            const messages = await this.conversationModel.findOne({
                _id: message.conversationId,
                isBlock: false,     // điều kiện bổ sung
            })
                .populate({
                    path: 'messages', // Populate messages
                    options: { sort: { createdAt: -1 } }, // Sắp xếp mới trước
                    populate: [
                        { path: 'sender', select: 'fullName type' }, // Populate sender bên trong messages
                        { path: 'receiver', select: 'fullName type' }, // Populate receiver bên trong messages
                        { path: 'conversationId', select: 'members' }, // Populate receiver bên trong messages
                    ],
                })
                .exec();

            return { messages, receiver: message.receiver, conversationId: message.conversationId }

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
