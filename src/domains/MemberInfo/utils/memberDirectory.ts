import type {
  AdminUserListItem,
  EditMemberInfo,
  MemberInfo,
} from '@/shared/types';

import {
  convertBlacklistTypeToLabel,
  convertUserRoleIdToEnum,
} from '@/domains/MemberInfo/utils/memberInfoFormatters';

export type FilterValue = 'ALL' | string;

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

export function extractFirstSearchMember(result: unknown): MemberInfo | null {
  if (Array.isArray(result)) {
    return (result[0] as MemberInfo | undefined) ?? null;
  }

  return (result as MemberInfo | null) ?? null;
}

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

export function getAdmissionYear(studentNumber: string) {
  const digitsOnly = studentNumber.replace(/\D/g, '');

  if (digitsOnly.length < 2) {
    return EMPTY_TEXT;
  }

  const firstFour = digitsOnly.slice(0, 4);
  if (/^(19|20)\d{2}$/.test(firstFour)) {
    return firstFour;
  }

  return `20${digitsOnly.slice(0, 2)}`;
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

export function getAdmissionYearOptions(
  members: AdminUserListItem[]
): DirectoryFilterOption[] {
  const years = Array.from(
    new Set(
      members
        .map((member) => getAdmissionYear(member.studentNumber))
        .filter((year) => year !== EMPTY_TEXT)
    )
  ).sort((a, b) => Number(b) - Number(a));

  return years.map((value) => ({ value, label: value }));
}

export function getMajorOptions(
  members: AdminUserListItem[]
): DirectoryFilterOption[] {
  const majors = Array.from(
    new Set(members.map((member) => member.major).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'ko'));

  return majors.map((value) => ({ value, label: value }));
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
        if (newValue) diff[key] = String(newValue).substring(0, 10);
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
    studentNumber: member.studentNumber,
    major: member.major,
    userRoleId: member.userRoleId,
    userRoleName: convertUserRoleIdToEnum(member.userRoleId),
    createdAt: member.createdAt,
  };
}

export function normalizeSearchResultMembers(result: unknown): MemberInfo[] {
  if (Array.isArray(result)) {
    return result as MemberInfo[];
  }

  if (result) {
    return [result as MemberInfo];
  }

  return [];
}
