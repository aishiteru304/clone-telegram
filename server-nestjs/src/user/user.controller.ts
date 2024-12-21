import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import { FriendRequestDto } from './dto/friend-request.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.userService.register(registerUserDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto);
    }

    @Post("friend")
    async addFriend(@Req() req: Request, @Body() addFriendDto: AddFriendDto) {
        return this.userService.addFriend(req, addFriendDto);
    }

    @Get('information/:id')
    async getInformation(@Param('id') id: string) {
        return this.userService.getInformationById(id);
    }

    @Get('information/id/:phone')
    async getIdByPhoneNumber(@Req() req: Request, @Param('phone') phone: string) {
        return this.userService.getIdPhoneNumber(req, phone);
    }

    // @Post("friend/request")
    // async addFriendRequest(@Req() req: Request, @Body() friendRequestDto: FriendRequestDto) {
    //     return this.userService.addFriendRequest(req, friendRequestDto);
    // }

    @Get('relationship/:id')
    async checkRelationship(@Req() req: Request, @Param('id') id: string) {
        return this.userService.checkRelationship(req, id);
    }

}
