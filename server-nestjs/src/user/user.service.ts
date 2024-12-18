import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ACCOUNT_ROLE } from 'src/enums/user-status-role';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly jwtService: JwtService) { }

    async register(registerUserDto: RegisterUserDto) {
        try {
            // Lấy dữ liệu từ body
            const { fullName, email, password } = registerUserDto;

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await this.userModel.findOne({ email });
            if (existingUser) {
                throw new HttpException('Email already exists', HttpStatus.UNAUTHORIZED);
            }

            // Hash mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const newUser = new this.userModel({
                fullName,
                email,
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
            const { email, password } = loginDto;

            // Kiểm tra email đã tồn tại chưa 
            const existingUser = await this.userModel.findOne({ email });
            if (!existingUser) {
                throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
            }

            // Kiểm tra mật khẩu có chính xác không
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
            }

            // Tạo access token
            const accessToken = this.jwtService.sign({ id: existingUser.id, role: existingUser.role });

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
                message: 'User logged successfully.',
                data: { accessToken, fullName: existingUser.fullName, role: existingUser.role }
            };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async adminLogin(loginDto: LoginDto) {

        try {
            // Lấy dữ liệu từ body
            const { email, password } = loginDto;

            // Kiểm tra email đã tồn tại chưa 
            const existingUser = await this.userModel.findOne({ email, role: ACCOUNT_ROLE.ADMIN });
            if (!existingUser) {
                throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
            }

            // Kiểm tra mật khẩu có chính xác không
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
            }

            // Tạo access token
            const accessToken = this.jwtService.sign({ id: existingUser.id, role: existingUser.role });

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
                message: 'User logged successfully.',
                data: { accessToken, fullName: existingUser.fullName, role: existingUser.role }
            };
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    getAllUsers(): Promise<User[]> {
        try {
            return this.userModel.find({ role: { $ne: ACCOUNT_ROLE.ADMIN } }).select("-password");
        }
        catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async getProfile(req: Request): Promise<User> {
        try {
            const user = req['user'];
            const userProfile = await this.userModel.findById(user.id).select('-password');

            if (!userProfile) {
                throw new HttpException('User not existing', HttpStatus.NOT_FOUND);
            }

            return userProfile;
        } catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteUser(id: string) {
        try {

            // Tìm và xóa người dùng bởi ID
            const deletedUser = await this.userModel.findByIdAndDelete(id);

            if (!deletedUser) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            // Trả về phản hồi thành công
            return {
                statusCode: HttpStatus.OK,
                message: 'User deleted successfully.',
            };
        }
        catch (error) {
            // Kiểm tra nếu lỗi là một HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
