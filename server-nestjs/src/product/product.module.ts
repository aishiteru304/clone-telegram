import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { JwtAuthAdminMiddleware } from 'src/middlewares/authAdmin';
import { JwtAuthUserMiddleware } from 'src/middlewares/authUser';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    NestjsFormDataModule
  ],
  providers: [ProductService, CloudinaryService],
  controllers: [ProductController]
})
export class ProductModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthAdminMiddleware)
      .forRoutes(
        { path: 'product', method: RequestMethod.POST },
      );
    consumer
      .apply(JwtAuthUserMiddleware)
      .forRoutes(
        { path: 'user/profile', method: RequestMethod.GET },
        { path: 'user/:id', method: RequestMethod.DELETE },
      );
  }
}
