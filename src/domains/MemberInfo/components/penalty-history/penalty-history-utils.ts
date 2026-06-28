import type { BlacklistHistoryItem } from '@/shared/types';

import {
  BLACKLIST_DEMOTE_OPTIONS,
  RELEGATION_DEMOTE_OPTIONS,
  WARNING_REASON_OPTIONS,
} from '@/domains/MemberInfo/constants/memberInfo';

const WARNING_TYPES = ['경고', 'WARNING'];

export function isWarningType(type: string) {
  return WARNING_TYPES.some((warningType) => type.includes(warningType));
}

export function isPermanentDemotionType(type: string) {
  return type.includes('영구') || type === 'BLACKLIST';
}

export function getPenaltyTypeLabel(type: string) {
  if (isWarningType(type)) return '경고';
  if (isPermanentDemotionType(type)) return '영구 강등';
  return '일반 강등';
}

export function getReasonOptions(type: string) {
  if (isWarningType(type)) return WARNING_REASON_OPTIONS;
  if (isPermanentDemotionType(type)) return BLACKLIST_DEMOTE_OPTIONS;
  return RELEGATION_DEMOTE_OPTIONS;
}

export function findReasonType(history: BlacklistHistoryItem) {
  if (history.reasonType) return history.reasonType;

  return (
    getReasonOptions(history.type).find(
      (option) => option.label === history.blackReason
    )?.value ?? 'ETC'
  );
}

export function findReasonLabel(type: string, reasonType: string) {
  return (
    getReasonOptions(type).find((option) => option.value === reasonType)
      ?.label ?? '기타'
  );
}

export function getDefaultReasonType(type: string) {
  return getReasonOptions(type)[0]?.value ?? 'ETC';
}

export function getDefaultDurationDays(type: string, reasonType: string) {
  if (isWarningType(type) || isPermanentDemotionType(type)) return '';

  const option = RELEGATION_DEMOTE_OPTIONS.find(
    (item) => item.value === reasonType
  );

  return typeof option?.month === 'number' ? String(option.month * 30) : '30';
}

export function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isOngoingPenalty(history: BlacklistHistoryItem) {
  if (history.deletedAt || isWarningType(history.type)) return false;

  const now = new Date();
  const startDate = toDate(history.blacklistStartDate ?? history.createdAt);
  const endDate = toDate(history.blacklistDeadline);

  if (!startDate) return false;
  if (startDate.getTime() > now.getTime()) return false;
  return !endDate || endDate.getTime() >= now.getTime();
}

export function getPenaltyTone(history: BlacklistHistoryItem) {
  if (isOngoingPenalty(history)) {
    return 'border-rose-600 bg-rose-600 text-white';
  }

  if (isWarningType(history.type)) {
    return 'border-slate-200 bg-white text-slate-900';
  }

  if (isPermanentDemotionType(history.type)) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export function formatNow() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function getDaysBetween(start?: string | null, end?: string | null) {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate || !endDate) return '';

  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.round((endDate.getTime() - startDate.getTime()) / dayMs);
  return String(Math.max(1, days));
}

export function addDays(value: string, days: number) {
  const date = toDate(value) ?? new Date();
  date.setDate(date.getDate() + days);

  const pad = (target: number) => String(target).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function toDateTimeInputValue(value?: string | null) {
  if (!value) return '';
  return value.replace(' ', 'T').slice(0, 16);
}

export function fromDateTimeInputValue(value: string) {
  return `${value.replace('T', ' ')}:00`;
}

export function getWarningCountFromHistory(history: BlacklistHistoryItem) {
  return history.warningCount ?? 1;
}
