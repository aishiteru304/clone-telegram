import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AddFriendDto } from './dto/add-friend.dto';

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
    async addFriend(@Req() req: Request, @Body() addFrienđto: AddFriendDto) {
        return this.userService.addFriend(req, addFrienđto);
    }

    @Get('information/:id')
    async getInformation(@Param('id') id: string) {
        return this.userService.getInformationById(id);
    }

}
