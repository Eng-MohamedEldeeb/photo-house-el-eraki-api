export class ImportResultDto {
  inserted: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}
