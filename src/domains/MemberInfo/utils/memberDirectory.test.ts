import { describe, expect, test } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import {
  createMemberDiffPayload,
  getActivePenaltyLabel,
  getPenaltyStatus,
  getRoleBadgeMeta,
  isPermanentDemotionPenalty,
  isWarningPenalty,
} from './memberDirectory';

const MEMBER: MemberInfo = {
  encryptedUserId: 'encrypted-user-id',
  loginId: 'original-id',
  userName: '테스트',
  email: 'test@sookmyung.ac.kr',
  nickname: '테스터',
  userRoleId: 2,
  studentNumber: '1234567',
  major: '컴퓨터과학전공',
  birthday: '2000-01-01',
  pointBalance: 100,
  createdAt: '2026-01-01T00:00:00',
  authenticatedAt: null,
  totalWarningCount: 0,
  isBlacklist: false,
  blacklistStartDate: null,
  blacklistEndDate: null,
};

describe('createMemberDiffPayload', () => {
  test('변경 사항이 없으면 빈 payload를 반환한다', () => {
    expect(createMemberDiffPayload(MEMBER, { ...MEMBER })).toEqual({});
  });

  test('아이디만 변경하면 loginId만 payload에 포함한다', () => {
    const updated = { ...MEMBER, loginId: 'changed-id' };

    expect(createMemberDiffPayload(MEMBER, updated)).toEqual({
      loginId: 'changed-id',
    });
  });

  test('여러 값 중 실제로 변경된 필드만 payload에 포함한다', () => {
    const updated = {
      ...MEMBER,
      nickname: '새닉네임',
      major: '경영학부',
    };

    expect(createMemberDiffPayload(MEMBER, updated)).toEqual({
      nickname: '새닉네임',
      major: '경영학부',
    });
  });

  test('생년월일을 비우면 검증할 수 있도록 빈 값을 payload에 포함한다', () => {
    const updated = { ...MEMBER, birthday: '' };

    expect(createMemberDiffPayload(MEMBER, updated)).toEqual({ birthday: '' });
  });
});

describe('회원 제재 상태 판정', () => {
  test('활성 제재가 없으면 정상 상태를 success tone으로 표시한다', () => {
    expect(getPenaltyStatus(MEMBER)).toMatchObject({
      label: '정상',
      tone: 'success',
    });
  });

  test('일반강등 중 경고가 추가되어도 강등 상태를 우선 표시한다', () => {
    const member = {
      ...MEMBER,
      userRoleId: 6,
      isBlacklist: true,
      blacklistType: 'WARNING',
      currentWarningCount: 1,
    };

    expect(getActivePenaltyLabel(member)).toBe('일반 강등');
    expect(getPenaltyStatus(member)).toMatchObject({
      label: '일반 강등',
      tone: 'danger',
      warningBadge: { label: '경고 1회', tone: 'warning' },
    });
    expect(isWarningPenalty(member)).toBe(false);
  });

  test('일반강등 중 현재 경고가 없으면 경고를 함께 표시하지 않는다', () => {
    const member = {
      ...MEMBER,
      userRoleId: 6,
      isBlacklist: true,
      blacklistType: 'RELEGATION',
      currentWarningCount: 0,
    };

    expect(getPenaltyStatus(member)).toMatchObject({
      label: '일반 강등',
      tone: 'danger',
      warningBadge: undefined,
    });
  });

  test('강등자가 아닌 회원의 경고는 횟수와 함께 표시한다', () => {
    const member = {
      ...MEMBER,
      isBlacklist: true,
      blacklistType: 'WARNING',
      currentWarningCount: 1,
    };

    expect(getPenaltyStatus(member)).toMatchObject({
      label: '경고 1회',
      tone: 'warning',
    });
    expect(isWarningPenalty(member)).toBe(true);
  });

  test('영구강등 여부를 판정한다', () => {
    const member = {
      ...MEMBER,
      userRoleId: 6,
      isBlacklist: true,
      blacklistType: 'BLACKLIST',
    };

    expect(isPermanentDemotionPenalty(member)).toBe(true);
    expect(getPenaltyStatus(member)).toMatchObject({
      label: '영구 강등',
      tone: 'danger',
      summary: '영구강등이 적용되어 해제 기한 없이 이용이 제한됩니다.',
      summaryTone: 'bg-slate-950 text-white',
    });
  });
});

describe('회원 등급 배지 메타데이터', () => {
  test.each([
    [1, '준회원', 'neutral'],
    [2, '정회원', 'success'],
    [4, '리자', 'accent'],
    [5, '공식', 'info'],
    [6, '강등자', 'danger'],
    [7, '광고주', 'info'],
  ] as const)('%s 등급에 %s·%s tone을 반환한다', (roleId, label, tone) => {
    expect(getRoleBadgeMeta(roleId)).toEqual({ label, tone });
  });

  test('알 수 없는 등급은 neutral로 표시한다', () => {
    expect(getRoleBadgeMeta(999)).toEqual({
      label: '알 수 없음',
      tone: 'neutral',
    });
  });
});
