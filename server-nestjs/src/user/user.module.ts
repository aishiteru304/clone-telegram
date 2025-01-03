import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthUserMiddleware } from 'src/middlewares/authUser';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    NotificationModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, MongooseModule]

})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthUserMiddleware)
      .forRoutes(
        { path: 'user/friend', method: RequestMethod.POST },
        { path: 'user/friend/request', method: RequestMethod.POST },
        { path: 'user/information/:id', method: RequestMethod.GET },
        { path: 'user/information/id/:phone', method: RequestMethod.GET },
        { path: 'user/information', method: RequestMethod.GET },
        { path: 'user/relationship/:id', method: RequestMethod.GET },
      );
  }

}
