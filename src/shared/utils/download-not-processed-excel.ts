import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import type { ExcelPointBulkNotProcessedRow } from '@/shared/types';

/**
 * 처리되지 않은 행 데이터를 브라우저에서 .xlsx로 저장합니다.
 */
export function downloadNotProcessedRowsExcel(
  rows: ExcelPointBulkNotProcessedRow[],
  formatReason: (reason: string) => string
): void {
  if (rows.length === 0) {
    return;
  }

  const sheetRows = rows.map((row) => ({
    '행 번호': row.rowNumber,
    아이디: row.loginId,
    학번: row.studentNumber,
    '사유(코드)': row.reason,
    설명: formatReason(row.reason),
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '미처리');

  const stamp = format(new Date(), 'yyyyMMdd_HHmmss');
  XLSX.writeFile(workbook, `처리되지않은명단_${stamp}.xlsx`);
}
