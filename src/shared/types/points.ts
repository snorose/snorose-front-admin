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

export interface ExcelPointBulkNotProcessedRow {
  rowNumber: number;
  loginId: string;
  studentNumber: string;
  reason: string;
}

export interface ExcelPointBulkRewardResult {
  requestedCount: number;
  successCount: number;
  failedCount: number;
  successLoginIds: string[];
  notProcessedRows: ExcelPointBulkNotProcessedRow[];
}

export interface ExcelPointBulkRewardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: ExcelPointBulkRewardResult;
}
