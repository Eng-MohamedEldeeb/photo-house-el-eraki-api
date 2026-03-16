import { IsString, IsOptional } from 'class-validator';

export class SheetsSyncDto {
  @IsString()
  spreadsheetId: string;

  @IsString()
  @IsOptional()
  sheetName?: string;    // defaults to 'Products' or 'Categories'
}
