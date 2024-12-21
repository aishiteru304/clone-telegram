import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    JwtModule,
    UserModule
  ],
  providers: [FriendService],
  exports: [FriendService]
})
export class FriendModule { }
