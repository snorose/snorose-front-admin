import { afterEach, describe, expect, test, vi } from 'vitest';

import { getRelegationEndDateTimeLabel } from './penalty-history-add-utils';
import {
  getPenaltyBadgeMeta,
  getPenaltyProgressBadgeMeta,
  getWarningCountByReason,
  isPositiveInteger,
} from './penalty-history-utils';

describe('getWarningCountByReason', () => {
  test('선택한 경고 사유의 기본 횟수를 반환한다', () => {
    expect(getWarningCountByReason('LOW_QUALITY_POST')).toBe(1);
    expect(getWarningCountByReason('EXAM_RECALL_UNDER_50')).toBe(2);
  });

  test('기타 사유는 수정 가능한 1회부터 시작한다', () => {
    expect(getWarningCountByReason('ETC')).toBe(1);
  });
});

describe('isPositiveInteger', () => {
  test.each([1, 2, '3'] as const)('%s는 1 이상의 정수다', (value) => {
    expect(isPositiveInteger(value)).toBe(true);
  });

  test.each([0, -1, 1.5, '2.5', '', Number.NaN] as const)(
    '%s는 1 이상의 정수가 아니다',
    (value) => {
      expect(isPositiveInteger(value)).toBe(false);
    }
  );
});

describe('getPenaltyBadgeMeta', () => {
  test('진행 중인 영구 강등은 danger tone으로 표시한다', () => {
    expect(
      getPenaltyBadgeMeta({
        encryptedUserId: 'encrypted-user-id',
        studentNumber: '1234567',
        type: '영구 강등',
        blackReason: '족보 무단 배포',
        createdAt: '2026-01-01 00:00:00',
        blacklistStartDate: '2026-01-01 00:00:00',
        relegationMonth: null,
        adminName: '관리자',
      })
    ).toEqual({ label: '영구 강등', tone: 'danger' });
  });

  test('경고는 warning tone으로 표시한다', () => {
    expect(
      getPenaltyBadgeMeta({
        encryptedUserId: 'encrypted-user-id',
        studentNumber: '1234567',
        type: 'WARNING',
        blackReason: '운영 정책 위반',
        createdAt: '2026-01-01 00:00:00',
        blacklistStartDate: null,
        relegationMonth: null,
        adminName: '관리자',
      })
    ).toEqual({ label: '경고', tone: 'warning' });
  });
});

describe('제재 이력 상태 표시', () => {
  const history = {
    encryptedUserId: 'encrypted-user-id',
    studentNumber: '1234567',
    type: 'RELEGATION',
    blackReason: '운영 정책 위반',
    createdAt: '2026-10-18 01:20:21',
    relegationMonth: 12,
    adminName: '관리자',
  };

  test.each([
    '2000-01-01 00:00:00',
    '2026-10-18 01:20:21',
    '2099-01-01 00:00:00',
  ])(
    '%s 생성 이력의 개월 수로 진행 중·종료 상태를 추정하지 않는다',
    (createdAt) => {
      expect(getPenaltyProgressBadgeMeta({ ...history, createdAt })).toBeNull();
    }
  );

  test.each(['WARNING', 'BLACKLIST', '영구 강등'])(
    '%s 이력도 진행 상태를 추정하지 않는다',
    (type) => {
      expect(getPenaltyProgressBadgeMeta({ ...history, type })).toBeNull();
    }
  );

  test('서버가 취소 일시를 제공한 제재는 취소 상태를 표시한다', () => {
    expect(
      getPenaltyProgressBadgeMeta({
        ...history,
        deletedAt: '2026-10-19 00:00:00',
      })
    ).toEqual({ label: '취소', tone: 'neutral' });
    expect(
      getPenaltyBadgeMeta({ ...history, deletedAt: '2026-10-19 00:00:00' })
    ).toEqual({ label: '일반 강등', tone: 'neutral' });
  });
});

describe('강등 부여 전 예상 종료일', () => {
  afterEach(() => vi.useRealTimers());

  test.each([
    ['2026-01-31T12:34:00', '2026-02-28 12:34'],
    ['2024-01-31T12:34:00', '2024-02-29 12:34'],
  ])('현재 시각 %s에서 한 달 뒤 예상 날짜를 유지한다', (now, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    expect(getRelegationEndDateTimeLabel(1)).toBe(expected);
  });
});
