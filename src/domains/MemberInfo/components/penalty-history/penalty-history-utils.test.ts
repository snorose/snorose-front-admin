import { describe, expect, test } from 'vitest';

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
        blacklistDeadline: null,
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
        blacklistDeadline: null,
        adminName: '관리자',
      })
    ).toEqual({ label: '경고', tone: 'warning' });
  });
});

describe('getPenaltyProgressBadgeMeta', () => {
  const demotion = {
    encryptedUserId: 'encrypted-user-id',
    studentNumber: '1234567',
    type: 'RELEGATION',
    blackReason: '운영 정책 위반',
    createdAt: '2026-01-01 00:00:00',
    blacklistStartDate: '2026-01-01 00:00:00',
    blacklistDeadline: '2099-01-01 00:00:00',
    adminName: '관리자',
  };

  test('진행 중인 강등은 danger tone으로 표시한다', () => {
    expect(getPenaltyProgressBadgeMeta(demotion)).toEqual({
      label: '진행중',
      tone: 'danger',
    });
  });

  test('종료된 강등과 취소된 제재는 neutral tone으로 표시한다', () => {
    expect(
      getPenaltyProgressBadgeMeta({
        ...demotion,
        blacklistDeadline: '2026-01-02 00:00:00',
      })
    ).toEqual({ label: '종료', tone: 'neutral' });
    expect(
      getPenaltyProgressBadgeMeta({
        ...demotion,
        deletedAt: '2026-01-02 00:00:00',
      })
    ).toEqual({ label: '취소', tone: 'neutral' });
  });
});
