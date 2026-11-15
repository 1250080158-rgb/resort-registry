import * as XLSX from 'xlsx';

/**
 * Xuất danh sách dòng ra file Excel .xlsx thật (SheetJS).
 * Mỗi phần tử của `rows` là một object — key thành tên cột, value thành ô dữ liệu.
 */
export function exportToExcel(rows: Array<Record<string, unknown>>, sheetName: string, filename: string): void {
  if (rows.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Độ rộng cột theo độ dài tiêu đề/dữ liệu (cắt ngưỡng 8–42 ký tự)
  const headers = Object.keys(rows[0]);
  worksheet['!cols'] = headers.map(h => ({
    wch: Math.min(42, Math.max(8, h.length + 2, ...rows.map(r => String(r[h] ?? '').length + 2))),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}
