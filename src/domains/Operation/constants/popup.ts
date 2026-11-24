import type { PopupStatus } from '../types/popup';

export const STATUS_LABELS: Record<PopupStatus, string> = {
  ACTIVE: '진행중',
  SCHEDULED: '예약',
  ENDED: '종료',
};
export const STATUS_CLASSES: Record<PopupStatus, string> = {
  ACTIVE: 'border-green-200 bg-green-50 text-green-700',
  SCHEDULED: 'border-blue-200 bg-blue-50 text-blue-700',
  ENDED: 'border-gray-200 bg-gray-50 text-gray-600',
};
