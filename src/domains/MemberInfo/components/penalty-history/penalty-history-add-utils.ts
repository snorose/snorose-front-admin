import { findReasonLabel } from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import {
  BLACKLIST_DEMOTE_OPTIONS,
  RELEGATION_DEMOTE_OPTIONS,
  WARNING_REASON_OPTIONS,
} from '@/domains/MemberInfo/constants/memberInfo';

export type AddPenaltyMode = 'WARNING' | 'DEMOTION';
export type DemotionType = 'RELEGATION' | 'BLACKLIST';

export const MEMO_MAX_LENGTH = 255;
export const DEFAULT_WARNING_REASON = WARNING_REASON_OPTIONS[0];
export const DEFAULT_RELEGATION_REASON = RELEGATION_DEMOTE_OPTIONS.find(
  (option) => option.value !== 'CURRENT_WARNING_3_EXCEEDED'
);
export const DEFAULT_BLACKLIST_REASON = BLACKLIST_DEMOTE_OPTIONS[0];

export const RELEGATION_REASON_OPTIONS = RELEGATION_DEMOTE_OPTIONS.filter(
  (option) => option.value !== 'CURRENT_WARNING_3_EXCEEDED'
);

export function getReasonLabel(
  reason: string,
  isWarningMode: boolean,
  demotionType: DemotionType
) {
  return findReasonLabel(isWarningMode ? 'WARNING' : demotionType, reason);
}

export function getWarningCountByReason(reason: string) {
  return (
    WARNING_REASON_OPTIONS.find((option) => option.value === reason)
      ?.warnCount ?? 1
  );
}

export function getDemotionTypeLabel(demotionType: DemotionType) {
  return demotionType === 'BLACKLIST' ? '영구강등' : '일반강등';
}

export function getRelegationEndDateTimeLabel(months: number) {
  const endDate = addMonthsClamped(new Date(), months);

  const year = endDate.getFullYear();
  const month = String(endDate.getMonth() + 1).padStart(2, '0');
  const day = String(endDate.getDate()).padStart(2, '0');
  const hours = String(endDate.getHours()).padStart(2, '0');
  const minutes = String(endDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function addMonthsClamped(date: Date, months: number) {
  const targetDate = new Date(date);
  const originalDay = targetDate.getDate();

  targetDate.setDate(1);
  targetDate.setMonth(targetDate.getMonth() + months);

  const lastDayOfTargetMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0
  ).getDate();

  targetDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return targetDate;
}
