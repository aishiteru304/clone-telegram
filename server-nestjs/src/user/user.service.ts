import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AddFriendDto } from './dto/add-friend.dto';
import { FriendRequestDto } from '../friend/dto/friend-request.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly jwtService: JwtService) { }

    async register(registerUserDto: RegisterUserDto) {
        try {
            // Lấy dữ liệu từ body
            const { fullName, phone, password } = registerUserDto;

            // Kiểm tra phone đã tồn tại chưa
            const existingUser = await this.userModel.findOne({ phone });
            if (existingUser) {
                throw new HttpException('Phone already exists', HttpStatus.UNAUTHORIZED);
            }

            // Hash mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const newUser = new this.userModel({
                fullName,
                phone,
                password: hashedPassword, // Lưu mật khẩu đã được hash
            });

            // Lưu vào cơ sở dữ liệu
            await newUser.save();

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

    async login(loginDto: LoginDto) {

        try {
            // Lấy dữ liệu từ body
            const { phone, password } = loginDto;

            // Kiểm tra phone đã tồn tại chưa 
            const existingUser = await this.userModel.findOne({ phone });
            if (!existingUser) {
                throw new HttpException('Invalid phone or password', HttpStatus.UNAUTHORIZED);
            }

            // Kiểm tra mật khẩu có chính xác không
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                throw new HttpException('Invalid phone or password', HttpStatus.UNAUTHORIZED);
            }

            // Tạo access token
            const accessToken = this.jwtService.sign({ id: existingUser._id });

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
                message: 'User logged successfully.',
                data: { accessToken, fullName: existingUser.fullName, id: existingUser._id }
            };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addFriend(req: Request, addFriendDto: AddFriendDto) {

        try {
            const sender = req["user"]
            // Lấy dữ liệu từ body
            const { userId } = addFriendDto;


            const receiverObjectId = new Types.ObjectId(userId);
            const senderObjectId = new Types.ObjectId(sender.id);

            // Kiểm tra user đã tồn tại chưa 
            const existingSender = await this.userModel.findById(senderObjectId);
            const existingReceiver = await this.userModel.findById(receiverObjectId);
            if (!existingSender || !existingReceiver) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            // Kiểm tra xem userId đã là bạn của user chưa
            if (existingSender.friends.some(friendId => friendId.toString() === userId)) {
                throw new HttpException('Already friends', HttpStatus.BAD_REQUEST);
            }

            existingReceiver.friends.unshift(existingSender);
            await existingReceiver.save();

            existingSender.friends.unshift(existingReceiver);
            await existingSender.save();

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
                message: 'Friend added successfully.',
            };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getInformationById(id: string) {
        try {
            // Truy vấn người dùng từ cơ sở dữ liệu và populate trường 'friends'
            const user = await this.userModel
                .findById(id).select("-password")
                .populate('friendsRequest', 'fullName')
                .exec();

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getIdPhoneNumber(req: Request, phone: string) {
        try {
            const sender = req["user"]
            const user = await this.userModel.findOne({ phone }).select("_id");

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            if (sender.id == user._id) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async checkRelationship(req: Request, id: string) {

        try {
            const sender = req["user"]
            const receiverObjectId = new Types.ObjectId(id);
            const senderObjectId = new Types.ObjectId(sender.id);

            // Kiểm tra user đã tồn tại chưa 
            const existingSender = await this.userModel.findById(senderObjectId);
            const existingReceiver = await this.userModel.findById(receiverObjectId);
            if (!existingSender || !existingReceiver) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            // Kiểm tra xem userId đã là bạn của user chưa
            if (existingSender.friends.some(friendId => friendId.toString() === id)) {
                // Trả về phản hồi thành công
                return {
                    statusCode: HttpStatus.OK,
                    data: { isFriend: true, isSendRequest: false, isReceiverRequest: false, noRelationship: false }
                };
            }

            // Kiểm tra xem sender đã nhận lời mời hay chưa
            if (existingSender.friendsRequest.some(friendId => friendId.toString() === id)) {
                // Trả về phản hồi thành công
                return {
                    statusCode: HttpStatus.OK,
                    data: { isFriend: false, isSendRequest: false, isReceiverRequest: true, noRelationship: false }
                };
            }


            // Kiểm tra xem sender đã gửi lời mời hay chưa
            if (existingReceiver.friendsRequest.some(friendId => friendId.toString() === sender.id)) {
                // Trả về phản hồi thành công
                return {
                    statusCode: HttpStatus.OK,
                    data: { isFriend: false, isSendRequest: true, isReceiverRequest: false, noRelationship: false }
                };
            }

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
                data: { isFriend: false, isSendRequest: false, isReceiverRequest: false, noRelationship: true }
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

