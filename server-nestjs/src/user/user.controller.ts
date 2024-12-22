import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';

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

    @Get('information/:id')
    async getInformation(@Param('id') id: string) {
        return this.userService.getInformationById(id);
    }

    @Get('information/id/:phone')
    async getIdByPhoneNumber(@Req() req: Request, @Param('phone') phone: string) {
        return this.userService.getIdPhoneNumber(req, phone);
    }


    @Get('relationship/:id')
    async checkRelationship(@Req() req: Request, @Param('id') id: string) {
        return this.userService.checkRelationship(req, id);
    }

}
