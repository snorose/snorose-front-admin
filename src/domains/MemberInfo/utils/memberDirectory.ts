import type { StatusBadgeTone } from '@/shared/components';
import type {
  AdminUserListItem,
  AdminUserListParams,
  AdminUserSortType,
  BlacklistHistoryItem,
  EditMemberInfo,
  MemberInfo,
  SortDirection,
  UserBlacklistHistory,
} from '@/shared/types';

import {
  convertBlacklistTypeToLabel,
  convertUserRoleIdToEnum,
} from '@/domains/MemberInfo/utils/memberInfoFormatters';

export type FilterValue = 'ALL' | string;

export type AdminUserListFilters = {
  page: number;
  keyword: string;
  selectedRole: FilterValue;
  selectedMajor: FilterValue;
  selectedAdmissionYear: FilterValue;
  sortType: AdminUserSortType;
  sortDirection: SortDirection;
};

// 디렉토리 필터/검색/정렬 상태를 v2 요청 쿼리 파라미터로 변환한다.
// 'ALL' 및 빈 검색어는 undefined로 만들어 요청에서 생략되도록 한다.
export function buildAdminUserListParams({
  page,
  keyword,
  selectedRole,
  selectedMajor,
  selectedAdmissionYear,
  sortType,
  sortDirection,
}: AdminUserListFilters): AdminUserListParams {
  return {
    page,
    keyword: keyword.trim() || undefined,
    userRoleId: selectedRole === 'ALL' ? undefined : Number(selectedRole),
    major: selectedMajor === 'ALL' ? undefined : selectedMajor,
    admissionYear:
      selectedAdmissionYear === 'ALL'
        ? undefined
        : Number(selectedAdmissionYear),
    sortType,
    sortDirection,
  };
}

export type DirectoryFilterOption = {
  label: string;
  value: string;
};

export type StatusBadgeMeta = {
  label: string;
  tone: StatusBadgeTone;
};

export type PenaltyStatus = StatusBadgeMeta & {
  warningBadge?: StatusBadgeMeta;
  summary: string;
  summaryTone: string;
};

export const EMPTY_TEXT = '-';

const EDIT_KEYS: (keyof EditMemberInfo)[] = [
  'loginId',
  'userName',
  'nickname',
  'studentNumber',
  'major',
  'userRoleId',
  'email',
  'birthday',
];

export function formatDisplayValue(value: string | null | undefined) {
  if (!value) return EMPTY_TEXT;
  return value;
}

export function formatPoint(value: number | null | undefined) {
  if (typeof value !== 'number') return EMPTY_TEXT;
  return `${value.toLocaleString()}P`;
}

export function toBlacklistHistoryItem(
  history: UserBlacklistHistory,
  fallback?: {
    encryptedUserId?: string;
    studentNumber?: string;
  }
): BlacklistHistoryItem {
  const isWarning = history.type === '경고' || history.type === 'WARNING';

  return {
    encryptedUserId: history.encryptedUserId ?? fallback?.encryptedUserId ?? '',
    studentNumber: history.studentNumber ?? fallback?.studentNumber ?? '',
    type: history.type,
    reasonType: history.reasonType,
    warningCount: history.warningCount,
    blackReason: history.blackReason,
    createdAt: history.createdAt,
    blacklistStartDate: isWarning
      ? null
      : (history.blacklistStartDate ?? history.createdAt),
    blacklistDeadline: history.blacklistDeadline,
    adminName: history.adminName ?? '',
    operatorMemo: history.memo ?? '',
    deletedAt: history.deletedAt,
    deletedReason: history.deletedReason,
    deletedBy: history.deletedBy,
  };
}

const ROLE_BADGE_META: Record<number, StatusBadgeMeta> = {
  1: { label: '준회원', tone: 'neutral' },
  2: { label: '정회원', tone: 'success' },
  4: { label: '리자', tone: 'accent' },
  5: { label: '공식', tone: 'info' },
  6: { label: '강등자', tone: 'danger' },
  7: { label: '광고주', tone: 'info' },
};

export function getRoleBadgeMeta(userRoleId: number): StatusBadgeMeta {
  return (
    ROLE_BADGE_META[userRoleId] ?? {
      label: '알 수 없음',
      tone: 'neutral',
    }
  );
}

// 현재 활성 제재가 '경고'인지 판별한다(강등 vs 경고 규칙의 단일 출처).
export function isWarningPenalty(member: MemberInfo): boolean {
  return (
    Boolean(member.isBlacklist) && getActivePenaltyLabel(member) === '경고'
  );
}

export function isPermanentDemotionPenalty(
  member: Pick<MemberInfo, 'blacklistType' | 'isBlacklist'>
) {
  return (
    Boolean(member.isBlacklist) &&
    convertBlacklistTypeToLabel(member.blacklistType) === '영구 강등'
  );
}

export function getActivePenaltyLabel(
  member: Pick<MemberInfo, 'blacklistType' | 'isBlacklist' | 'userRoleId'>
) {
  if (!member.isBlacklist) return '정상';

  const blacklistTypeLabel = convertBlacklistTypeToLabel(member.blacklistType);

  // 강등 중 경고를 추가하면 API의 blacklistType이 최신 경고(WARNING)로
  // 내려올 수 있으므로, 강등자 등급은 최신 경고보다 강등 상태를 우선한다.
  if (member.userRoleId === 6) {
    return blacklistTypeLabel === '영구 강등' ? '영구 강등' : '일반 강등';
  }

  return blacklistTypeLabel;
}

export function getPenaltyStatus(member: MemberInfo): PenaltyStatus {
  if (!member.isBlacklist) {
    return {
      label: '정상',
      tone: 'success',
      summary:
        member.totalWarningCount > 0
          ? '경고 이력은 있지만 현재 별도 제재 상태는 아닙니다.'
          : '제재 이력이 없습니다.',
      summaryTone: 'bg-emerald-50 text-emerald-700',
    };
  }

  const baseLabel = getActivePenaltyLabel(member);
  // 경고 상태는 횟수까지 노출한다(예: '경고 2회'). 3회면 자동 강등되므로 1·2회만 나타난다.
  const label =
    baseLabel === '경고' && typeof member.currentWarningCount === 'number'
      ? `경고 ${member.currentWarningCount}회`
      : baseLabel;
  const warningBadge =
    baseLabel === '일반 강등' &&
    typeof member.currentWarningCount === 'number' &&
    member.currentWarningCount >= 1
      ? {
          label: `경고 ${member.currentWarningCount}회`,
          tone: 'warning' as const,
        }
      : undefined;

  return {
    label,
    warningBadge,
    tone: baseLabel === '경고' ? 'warning' : 'danger',
    summary:
      baseLabel === '영구 강등'
        ? '영구강등이 적용되어 해제 기한 없이 이용이 제한됩니다.'
        : '현재 제재 상태가 적용 중입니다.',
    summaryTone:
      baseLabel === '영구 강등'
        ? 'bg-slate-950 text-white'
        : 'bg-rose-50 text-rose-700',
  };
}

export function getRemainingPenaltyLabel(
  endDate: string | null | undefined,
  now: Date = new Date()
) {
  if (!endDate) return EMPTY_TEXT;

  const targetDate = new Date(endDate);
  if (Number.isNaN(targetDate.getTime())) {
    return EMPTY_TEXT;
  }

  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return '종료됨';
  }

  const totalMinutes = Math.ceil(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}일`;
  if (hours > 0) return `${hours}시간`;
  return `${Math.max(minutes, 1)}분`;
}

export function getRoleOptions(): DirectoryFilterOption[] {
  return [
    { value: '1', label: '준회원' },
    { value: '2', label: '정회원' },
    { value: '4', label: '리자' },
    { value: '5', label: '공식' },
    { value: '6', label: '강등자' },
    { value: '7', label: '광고주' },
  ];
}

const MIN_ADMISSION_YEAR = 1900;

// 서버사이드 필터로 전환되어 현재 페이지 회원에서 추출할 수 없으므로,
// API 계약에 맞춰 4자리 입학 연도를 value로 사용한다.
export function getAdmissionYearOptions(): DirectoryFilterOption[] {
  const currentYear = new Date().getFullYear();
  const optionCount = currentYear - MIN_ADMISSION_YEAR + 1;

  return Array.from({ length: optionCount }, (_, index) => {
    const year = currentYear - index;

    return {
      value: String(year),
      label: String(year),
    };
  });
}

export function createMemberDiffPayload(
  original: MemberInfo,
  updated: MemberInfo
): Partial<EditMemberInfo> {
  const diff: Partial<EditMemberInfo> = {};

  EDIT_KEYS.forEach((key) => {
    const oldValue = original[key];
    const newValue = updated[key];

    if (oldValue === newValue) return;

    switch (key) {
      case 'loginId':
      case 'userName':
      case 'nickname':
      case 'email':
      case 'studentNumber':
      case 'major':
        if (typeof newValue === 'string') diff[key] = newValue;
        break;
      case 'birthday':
        if (typeof newValue === 'string') {
          diff[key] = newValue.trim().substring(0, 10);
        }
        break;
      case 'userRoleId':
        if (typeof newValue === 'number') diff[key] = newValue;
        break;
    }
  });

  return diff;
}

export function mapMemberInfoToAdminUserListItem(
  member: MemberInfo
): AdminUserListItem {
  return {
    encryptedUserId: member.encryptedUserId,
    loginId: member.loginId,
    userName: member.userName,
    nickname: member.nickname,
    email: member.email,
    studentNumber: member.studentNumber,
    major: member.major,
    userRoleId: member.userRoleId,
    userRoleName: convertUserRoleIdToEnum(member.userRoleId),
    pointBalance: member.pointBalance,
    createdAt: member.createdAt,
    authenticatedAt: member.authenticatedAt,
  };
}
