import type { MemberInfo } from '@/shared/types';

import {
  findReasonLabel,
  getWarningCountByReason,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import {
  BLACKLIST_DEMOTE_OPTIONS,
  RELEGATION_DEMOTE_OPTIONS,
  WARNING_REASON_OPTIONS,
} from '@/domains/MemberInfo/constants/memberInfo';

export type AddPenaltyMode = 'WARNING' | 'DEMOTION';
export type DemotionType = 'RELEGATION' | 'BLACKLIST';

// API의 기존 제재 추가 버그가 수정되면 false로 변경해 임시 제한을 해제한다.
// 영구강등 회원의 경고 제한 등 기존 정책은 각 팝업에서 계속 적용한다.
export const PENALTY_ADD_RESTRICTION_ENABLED = true;

export const PENALTY_ADD_BLOCKED_MESSAGE =
  '현재 경고 또는 강등이 남아 있는 회원은 이 페이지에서 경고/강등을 추가할 수 없습니다. 추가 부여가 필요한 경우 담당자에게 문의해주세요.';

export function isPenaltyAddTemporarilyBlocked(
  member: Pick<MemberInfo, 'currentWarningCount' | 'isBlacklist' | 'userRoleId'>
) {
  return (
    PENALTY_ADD_RESTRICTION_ENABLED &&
    ((member.currentWarningCount ?? 0) > 0 ||
      Boolean(member.isBlacklist) ||
      member.userRoleId === 6)
  );
}

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

export { getWarningCountByReason };

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
