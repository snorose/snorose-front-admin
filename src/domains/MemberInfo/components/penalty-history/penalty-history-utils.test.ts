import { describe, expect, test } from 'vitest';

import {
  getPenaltyTone,
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

describe('getPenaltyTone', () => {
  test('영구강등은 진행 중이어도 검은색으로 표시한다', () => {
    expect(
      getPenaltyTone({
        encryptedUserId: 'encrypted-user-id',
        studentNumber: '1234567',
        type: '영구 강등',
        blackReason: '족보 무단 배포',
        createdAt: '2026-01-01 00:00:00',
        blacklistStartDate: '2026-01-01 00:00:00',
        blacklistDeadline: null,
        adminName: '관리자',
      })
    ).toBe('border-slate-950 bg-slate-950 text-white');
  });
});
