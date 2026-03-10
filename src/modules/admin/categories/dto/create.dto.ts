import { IsString, IsOptional, MinLength, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @IsObject()
  @IsOptional()
  image: {
    publicId: string;
    url: string;
  };

  @IsString()
  @MinLength(2)
  nameEn: string;

  @IsString()
  @MinLength(2)
  nameAr: string;

  @IsOptional()
  @IsString()
  description?: string;
}
