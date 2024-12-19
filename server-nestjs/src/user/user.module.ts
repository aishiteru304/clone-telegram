import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthUserMiddleware } from 'src/middlewares/authUser';

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
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]

})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthUserMiddleware)
      .forRoutes(
        { path: 'user/friend', method: RequestMethod.POST },
        { path: 'user/information/:id', method: RequestMethod.GET },
        { path: 'user/:id', method: RequestMethod.DELETE },
      );
  }

}
