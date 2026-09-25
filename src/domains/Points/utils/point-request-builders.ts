import type {
  CreatePointFreeze,
  ExcelPointBulkRewardRequest,
  UpdatePointFreeze,
} from '@/shared/types';
import { toSpaceSeparatedDateTimeSeconds } from '@/shared/utils';

interface PointFreezeFormValues {
  title: string;
  startAt: string;
  endAt: string;
}

interface ExcelPointBulkRewardValues {
  bulkMemo: string;
  isReservation: boolean;
  reservationDateTime: string;
}

export function createPointFreezeRequest({
  title,
  startAt,
  endAt,
}: PointFreezeFormValues): CreatePointFreeze {
  return {
    title,
    startAt: toSpaceSeparatedDateTimeSeconds(startAt),
    endAt: toSpaceSeparatedDateTimeSeconds(endAt),
  };
}

export function updatePointFreezeRequest({
  title,
  startAt,
  endAt,
}: PointFreezeFormValues): UpdatePointFreeze {
  return createPointFreezeRequest({ title, startAt, endAt });
}

export function createExcelPointBulkRewardRequest({
  bulkMemo,
  isReservation,
  reservationDateTime,
}: ExcelPointBulkRewardValues): ExcelPointBulkRewardRequest {
  return {
    paymentMethod: isReservation ? 'RESERVED' : 'IMMEDIATE',
    bulkMemo,
    ...(isReservation && reservationDateTime
      ? { reservedAt: toSpaceSeparatedDateTimeSeconds(reservationDateTime) }
      : {}),
  };
}
