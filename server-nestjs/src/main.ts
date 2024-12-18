import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // Loại bỏ các trường không có trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu có trường không hợp lệ
    transform: true,          // Tự động chuyển đổi kiểu dữ liệu
  }));

  await app.listen(3000);
}
bootstrap();
