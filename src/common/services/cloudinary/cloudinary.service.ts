import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  /**
   * Upload a file buffer to Cloudinary
   * Returns the secure URL and public_id
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'photo-house',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result: UploadApiResponse) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      // pipe buffer into the stream
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Delete an image from Cloudinary by its public_id
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  }
}
