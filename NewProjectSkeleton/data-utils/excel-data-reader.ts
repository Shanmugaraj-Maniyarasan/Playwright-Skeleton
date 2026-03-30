import * as XLSX from 'xlsx';
import * as path from 'path';

export class ExcelDataReader {
  private static workbook: XLSX.WorkBook;

  static loadExcelFile(filePath: string): XLSX.WorkBook {
    const absolutePath = path.resolve(process.cwd(), filePath);
    this.workbook = XLSX.readFile(absolutePath);
    return this.workbook;
  }

  static getSheetData(sheetName: string): any[] {
    if (!this.workbook) {
      throw new Error('Excel file not loaded. Call loadExcelFile first.');
    }
    const worksheet = this.workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  static getDataByKey(sheetName: string, keyColumn: string, keyValue: string): any {
    const data = this.getSheetData(sheetName);
    return data.find(row => row[keyColumn] === keyValue);
  }

  static clearWorkbook(): void {
    this.workbook = null as any;
  }
}
