import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';

export type SheetRow = (string | number | boolean | null)[];
export type SheetData = { headers: string[]; rows: SheetRow[] };

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets: sheets_v4.Sheets;
  constructor(private readonly config: ConfigService) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.config.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        private_key: this.config
          .get<string>('GOOGLE_PRIVATE_KEY', '')
          .replace(/\\n/g, '\n'), // env vars flatten newlines
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }
  // Read all rows from a named sheet
  async readSheet(
    spreadsheetId: string,
    sheetName = 'Sheet1',
  ): Promise<SheetData> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
    const values: SheetRow[] = (res.data.values as SheetRow[]) ?? [];
    if (values.length === 0) return { headers: [], rows: [] };
    const headers = values[0].map((h) => String(h ?? '').trim());
    return { headers, rows: values.slice(1) };
  }
  // Overwrite sheet: clear, write headers + rows, bold header
  async writeSheet(
    spreadsheetId: string,
    sheetName: string,
    headers: string[],
    rows: SheetRow[],
  ): Promise<void> {
    await this.ensureSheet(spreadsheetId, sheetName);
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: sheetName,
    });
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers, ...rows] },
    });
    const sheetId = await this.getSheetId(spreadsheetId, sheetName);
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 11 },
                },
              },
              fields: 'userEnteredFormat(textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });
  }
  // Create sheet tab if it does not exist
  private async ensureSheet(id: string, name: string) {
    const meta = await this.sheets.spreadsheets.get({ spreadsheetId: id });
    const exists = meta.data.sheets?.some((s) => s.properties?.title === name);
    if (!exists) {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: id,
        requestBody: {
          requests: [{ addSheet: { properties: { title: name } } }],
        },
      });
    }
  }
  private async getSheetId(id: string, name: string): Promise<number> {
    const meta = await this.sheets.spreadsheets.get({ spreadsheetId: id });
    return (
      meta.data.sheets?.find((s) => s.properties?.title === name)?.properties
        ?.sheetId ?? 0
    );
  }
}
