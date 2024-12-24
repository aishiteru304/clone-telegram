import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { FriendRequestDto } from './dto/friend-request.dto';

@Injectable()
export class FriendService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly jwtService: JwtService) { }

    async getFriends(accessToken: string) {
        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });

            // Truy vấn người dùng từ cơ sở dữ liệu và populate trường 'friends'
            const user = await this.userModel
                .findById(decoded.id)
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

    async getFriendsRequest(accessToken: string) {
        try {
            // Giải mã token và lấy userId
            const decoded = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });


            // Truy vấn người dùng từ cơ sở dữ liệu và populate trường 'friends'
            const user = await this.userModel
                .findById(decoded.id)
                .populate('friendsRequest', 'fullName')
                .populate('friendsRequestSent', 'fullName')
                .exec();


            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return { requestReceived: user.friendsRequest, requestSent: user.friendsRequestSent };
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

    async addFriendRequest(friendRequestDto: FriendRequestDto) {

        try {
            // Lấy dữ liệu từ body
            const { userId, accessToken } = friendRequestDto;
            // Giải mã token và lấy userId
            const sender = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });



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

            existingReceiver.friendsRequest.unshift(existingSender);
            await existingReceiver.save();

            existingSender.friendsRequestSent.unshift(existingReceiver);
            await existingSender.save();

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

    async deleteFriendRequest(friendRequestDto: FriendRequestDto) {

        try {
            // Lấy dữ liệu từ body
            const { userId, accessToken } = friendRequestDto;
            // Giải mã token và lấy userId
            const sender = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });



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

            // Xóa bằng filter
            existingReceiver.friendsRequest = existingReceiver.friendsRequest.filter(
                (friendRequest) => friendRequest.toString() !== existingSender._id.toString()
            );
            await existingReceiver.save();

            // Xóa bằng filter
            existingSender.friendsRequestSent = existingSender.friendsRequestSent.filter(
                (friendRequest) => friendRequest.toString() !== existingReceiver._id.toString()
            );
            await existingSender.save();

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

    async rejectFriendRequest(friendRequestDto: FriendRequestDto) {

        try {
            // Lấy dữ liệu từ body
            const { userId, accessToken } = friendRequestDto;
            // Giải mã token và lấy userId
            const sender = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });

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

            // Xóa bằng filter
            existingSender.friendsRequest = existingSender.friendsRequest.filter(
                (friendRequest) => friendRequest.toString() !== existingReceiver._id.toString()
            );
            await existingSender.save();

            // Xóa bằng filter
            existingReceiver.friendsRequestSent = existingReceiver.friendsRequestSent.filter(
                (friendRequest) => friendRequest.toString() !== existingSender._id.toString()
            );
            await existingReceiver.save();

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

    async acceptFriendRequest(friendRequestDto: FriendRequestDto) {

        try {
            // Lấy dữ liệu từ body
            const { userId, accessToken } = friendRequestDto;
            // Giải mã token và lấy userId
            const sender = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });

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

            // Xóa bằng filter
            existingSender.friendsRequest = existingSender.friendsRequest.filter(
                (friendRequest) => friendRequest.toString() !== existingReceiver._id.toString()
            );

            existingReceiver.friendsRequestSent = existingReceiver.friendsRequestSent.filter(
                (friendRequest) => friendRequest.toString() !== existingSender._id.toString()
            );

            existingSender.friends.unshift(existingReceiver);
            await existingSender.save();

            existingReceiver.friends.unshift(existingSender);
            await existingReceiver.save();

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

    async deleteFriend(friendRequestDto: FriendRequestDto) {

        try {
            // Lấy dữ liệu từ body
            const { userId, accessToken } = friendRequestDto;
            // Giải mã token và lấy userId
            const sender = this.jwtService.verify(accessToken, { secret: process.env.JWT_SECRET });

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
                // Xóa bằng filter
                existingReceiver.friends = existingReceiver.friends.filter(
                    (friend) => friend.toString() !== existingSender._id.toString()
                );
                await existingReceiver.save();

                existingSender.friends = existingSender.friends.filter(
                    (friend) => friend.toString() !== existingReceiver._id.toString()
                );
                await existingSender.save();

                // Trả về phản hồi thành công
                return {
                    statusCode: HttpStatus.OK,
                };
            }

            throw new HttpException('No friends', HttpStatus.BAD_REQUEST);

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
