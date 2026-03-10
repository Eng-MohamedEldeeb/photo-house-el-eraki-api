import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { CloudinaryService } from '../utils/cloudinary/cloudinary.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CloudInterceptor implements NestInterceptor {
  constructor(
    private readonly cloudService: CloudinaryService,
    private readonly reflector: Reflector,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const directory = this.reflector.get<string>(
      'directory',
      context.getHandler(),
    );

    const file = request.file;
    if (file) {
      const { url, publicId } = await this.cloudService.uploadImage(
        file,
        directory,
      );

      request.body.image = { publicId, url };

      return next.handle().pipe(
        catchError((err) => {
          this.cloudService.deleteImage(publicId);
          return throwError(() => err);
        }),
      );
    }
    return next.handle();
  }
}
