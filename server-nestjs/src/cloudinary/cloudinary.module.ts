import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';

@Module({
  providers: [CloudinaryService, CloudinaryProvider]
})
export class CloudinaryModule { }
