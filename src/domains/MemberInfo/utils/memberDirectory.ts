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

export type PenaltyStatus = {
  label: string;
  summary: string;
  tone: string;
};

export const EMPTY_TEXT = '-';

const EDIT_KEYS: (keyof EditMemberInfo)[] = [
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

export function formatDate(value: string | null | undefined) {
  if (!value) return EMPTY_TEXT;
  return value.substring(0, 10);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return EMPTY_TEXT;

  const normalizedValue = value.replace('T', ' ');
  return normalizedValue.slice(0, 16);
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
    adminId: history.adminId,
    operatorMemo: history.memo ?? '',
    deletedAt: history.deletedAt,
    deletedReason: history.deletedReason,
    deletedBy: history.deletedBy,
  };
}

export function getRoleBadgeClassName(userRoleId: number) {
  switch (userRoleId) {
    case 1:
      return 'bg-slate-100 text-slate-700';
    case 2:
      return 'bg-emerald-100 text-emerald-700';
    case 4:
      return 'bg-indigo-100 text-indigo-700';
    case 5:
      return 'bg-sky-100 text-sky-700';
    case 6:
      return 'bg-rose-100 text-rose-700';
    case 7:
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getPenaltyStatus(member: MemberInfo): PenaltyStatus {
  if (!member.isBlacklist) {
    return {
      label: '정상',
      tone: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
      summary:
        member.totalWarningCount > 0
          ? '경고 이력은 있지만 현재 별도 제재 상태는 아닙니다.'
          : '제재 이력이 없습니다.',
    };
  }

  return {
    label: convertBlacklistTypeToLabel(member.blacklistType),
    tone: 'border border-rose-200 bg-rose-50 text-rose-700',
    summary: '현재 제재 상태가 적용 중입니다.',
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

// 입학년도 필터 옵션 개수 (최근 N개년)
const ADMISSION_YEAR_RANGE = 20;

// 서버사이드 필터로 전환되어 현재 페이지 회원에서 추출할 수 없으므로,
// 학번 앞 2자리(예: '25')를 value로 하는 최근 N개년 목록을 정적으로 생성한다.
export function getAdmissionYearOptions(): DirectoryFilterOption[] {
  const currentTwoDigit = new Date().getFullYear() % 100;

  return Array.from({ length: ADMISSION_YEAR_RANGE }, (_, index) => {
    const twoDigit = currentTwoDigit - index;
    const value = String(twoDigit).padStart(2, '0');
    return { value, label: `${value}학번` };
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
      case 'userName':
      case 'nickname':
      case 'email':
      case 'studentNumber':
      case 'major':
        if (typeof newValue === 'string') diff[key] = newValue;
        break;
      case 'birthday':
        if (typeof newValue === 'string' && newValue.trim()) {
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
