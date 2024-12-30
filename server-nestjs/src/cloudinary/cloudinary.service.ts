import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
// export class CloudinaryService {
//     uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
//         return new Promise<CloudinaryResponse>((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//                 (error, result) => {
//                     if (error) return reject(error);
//                     resolve(result);
//                 },
//             );

//             streamifier.createReadStream(file.buffer).pipe(uploadStream);
//         });
//     }
// }


@Injectable()
export class CloudinaryService {
    uploadFile(base64File: string): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            // Chuyển Base64 thành Buffer
            const buffer = Buffer.from(base64File, 'base64');

            // Tạo stream từ buffer
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }
}

