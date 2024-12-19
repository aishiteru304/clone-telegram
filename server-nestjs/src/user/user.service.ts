import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AddFriendDto } from './dto/add-friend.dto';

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
                data: { accessToken, fullName: existingUser.fullName }
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
            if (existingSender.friends.includes(existingReceiver)) {
                throw new HttpException('Already friends', HttpStatus.BAD_REQUEST);
            }

            existingReceiver.friends.push(existingSender);
            await existingReceiver.save();

            existingSender.friends.push(existingReceiver);
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

    async getFriends(accessToken: string) {
        try {
            // Giải mã token và lấy userId
            const decodedToken = this.jwtService.decode(accessToken);

            if (!decodedToken || !decodedToken.id) {
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }

            // Truy vấn người dùng từ cơ sở dữ liệu và populate trường 'friends'
            const user = await this.userModel
                .findById(decodedToken.id)
                .populate('friends', 'fullName')
                .exec();


            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return user.friends;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

