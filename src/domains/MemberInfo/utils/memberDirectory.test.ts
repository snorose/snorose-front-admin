import { describe, expect, test } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import {
  createMemberDiffPayload,
  getActivePenaltyLabel,
  getPenaltyStatus,
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
      warningLabel: '경고 1회',
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
      warningLabel: undefined,
    });
  });

  test('강등자가 아닌 회원의 경고는 횟수와 함께 표시한다', () => {
    const member = {
      ...MEMBER,
      isBlacklist: true,
      blacklistType: 'WARNING',
      currentWarningCount: 1,
    };

    expect(getPenaltyStatus(member).label).toBe('경고 1회');
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
      tone: 'border border-slate-950 bg-slate-950 text-white',
      summary: '영구강등이 적용되어 해제 기한 없이 이용이 제한됩니다.',
      summaryTone: 'bg-slate-950 text-white',
    });
  });
});
