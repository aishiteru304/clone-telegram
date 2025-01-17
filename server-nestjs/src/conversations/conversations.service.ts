import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Conversation } from './schemas/conversation.schema';
import { TypeConversation } from 'src/enums/type-conversation.enum';
import { HiddenConversationDto } from './dto/hidden-conversation.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateGroupDto } from './dto/create-group-conversation.dto';

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

            if (userIds.length == 2) {
                // Tạo mới private conversation 
                const conversation = new this.conversationModel({
                    members: userIds,
                    type: TypeConversation.PRIVATE
                });
                await conversation.save();
            }
            else {
                // Tạo mới group conversation 
                const conversation = new this.conversationModel({
                    members: userIds,
                    type: TypeConversation.GROUP
                });
                await conversation.save();
            }

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

    async createGroupConversation(createGroupDto: CreateGroupDto) {

        try {

            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(createGroupDto.accessToken, { secret: process.env.JWT_SECRET });

            // Lấy dữ liệu từ body
            const { phones } = createGroupDto;

            if (phones.length < 2) {
                throw new HttpException('Group needs more than 2 members', HttpStatus.BAD_REQUEST);
            }

            // Kiểm tra các userIds có tồn tại trong database
            const users = await this.userModel.find({ phone: { $in: phones } });

            // Kiểm tra xem decode.id có tồn tại trong danh sách users
            const myselfUser = users.find(user => user._id.toString() === decoded.id);

            if (myselfUser) {
                throw new HttpException('Can not add myself to group', HttpStatus.BAD_REQUEST);
            }

            if (users.length !== phones.length) {
                throw new HttpException('One or more users do not exist', HttpStatus.BAD_REQUEST);
            }

            // Tạo mảng userIds
            const userIds = [decoded.id, ...users.map(user => user._id.toString())];

            // Kiểm tra xem đã có conversation với các userIds này chưa
            const existingConversation = await this.conversationModel.findOne({
                members: { $all: userIds }, // Kiểm tra members chứa tất cả userIds
                $expr: { $eq: [{ $size: "$members" }, userIds.length] }, // Kiểm tra độ dài members
            });


            if (existingConversation) {
                throw new HttpException('Group already exists', HttpStatus.BAD_REQUEST);
            }


            // Tạo mới group conversation 
            const conversation = new this.conversationModel({
                members: userIds,
                type: TypeConversation.GROUP,
                name: "New Group"
            });
            await conversation.save();

            // Trả về phản hồi thành công
            return userIds
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

    async getConversations(req: Request) {
        try {
            const user = req['user']
            // Giải mã token và lấy userId

            // Truy vấn conversation từ cơ sở dữ liệu và populate trường 'friends'
            const conversations = await this.conversationModel.find({
                members: user.id,// Điều kiện members chứa userId
                isBlock: false,
                hidden: { $ne: user.id },
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


            if (!conversation) {
                throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
            }

            return conversation;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
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

    async getConversationByMembers(req: Request, receiverIds: CreateConversationDto) {
        try {
            const user = req['user']
            const userIds = [...receiverIds.userIds, user.id]

            // Kiểm tra xem đã có conversation với các userIds này chưa
            const conversation = await this.conversationModel.findOne({
                members: { $all: userIds }, // Kiểm tra members chứa tất cả userIds
                $expr: { $eq: [{ $size: "$members" }, userIds.length] }, // Kiểm tra độ dài members
            });

            if (!conversation) {
                throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
            }

            return conversation;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getConversationListByUserId(userId: string) {
        try {

            // Truy vấn conversation từ cơ sở dữ liệu và populate trường 'friends'
            const conversations = await this.conversationModel.find({
                members: userId,// Điều kiện members chứa userId
                isBlock: false,
                hidden: { $ne: userId },
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
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async hiddenConversation(hiddenConversationDto: HiddenConversationDto) {

        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(hiddenConversationDto.accessToken, { secret: process.env.JWT_SECRET });

            const conversation = await this.conversationModel.findById(hiddenConversationDto.conversationId)

            // Kiểm tra xem decoded.id đã tồn tại trong mảng hidden hay chưa
            if (!conversation.hidden.includes(decoded.id)) {
                conversation.hidden.push(decoded.id); // Thêm userId vào mảng hidden
                await conversation.save(); // Lưu lại tài liệu
            }
            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
            };
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
