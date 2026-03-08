import { Readable } from 'stream';
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * Upload file buffer to Cloudinary.
   * Returns: { url: string, publicId: string }
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'photo-house/products',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result: UploadApiResponse) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      // pipe the in-memory buffer into the upload stream
      Readable.from(file.buffer).pipe(stream);
    });
  }

  /**
   * Delete image from Cloudinary by its public_id.
   * Called automatically on product update or delete.
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(new BadRequestException(error.message));
        resolve();
      });
    });
  }
}
