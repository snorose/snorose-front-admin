export interface AdjustSinglePoint {
  encryptedUserId: string;
  difference?: number;
  category: string;
  sourceId?: number;
  source: string;
  memo?: string;
}

export interface PointFreezeBase {
  title: string;
  startAt: string;
  endAt: string;
}

export interface PointFreeze extends PointFreezeBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type CreatePointFreeze = PointFreezeBase;
export type UpdatePointFreeze = PointFreezeBase;

export interface AdjustAllMemberPoint {
  category: string;
  memo: string;
  difference: number;
}

export type ExcelPointPaymentMethod = 'IMMEDIATE' | 'RESERVED';

export interface ExcelPointBulkRewardRequest {
  paymentMethod: ExcelPointPaymentMethod;
  reservedAt?: string;
  bulkMemo?: string;
}

export interface ExcelPointBulkSuccessRow {
  userName: string;
  loginId: string;
  studentNumber: string;
  difference: number;
  category: string;
  memo: string;
}

export interface ExcelPointBulkNotProcessedRow {
  rowNumber: number;
  userName: string;
  loginId: string | null;
  studentNumber: string;
  difference: string | number;
  category: string;
  memo: string;
  reason: string;
}

export interface ExcelPointBulkRewardResult {
  requestedCount: number;
  successCount: number;
  failedCount: number;
  successRows: ExcelPointBulkSuccessRow[];
  notProcessedRows: ExcelPointBulkNotProcessedRow[];
}

export interface ExcelPointBulkRewardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: ExcelPointBulkRewardResult;
}
