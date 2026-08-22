import { describe, expect, test } from 'vitest';

import type {
  ExamReviewAdminStatusManager,
  ExamReviewAdminStatusPeriod,
} from '@/domains/Reviews/types';

import {
  getAverageProcessedCount,
  getDefaultAdminStatusPeriod,
  getExamReviewCompletionRate,
  sortAdminStatusPeriods,
} from './exam-admin-status';

const createPeriod = (
  id: number,
  startAt: string,
  endAt: string
): ExamReviewAdminStatusPeriod => ({
  id,
  title: `기간 ${id}`,
  startAt,
  endAt,
  createdAt: startAt,
  updatedAt: startAt,
});

describe('시험후기 담당 관리자 현황 계산', () => {
  test('확인 완료율을 정수로 반올림하고 0~100 범위로 제한한다', () => {
    expect(getExamReviewCompletionRate(4, 7)).toBe(57);
    expect(getExamReviewCompletionRate(0, 0)).toBe(0);
    expect(getExamReviewCompletionRate(8, 7)).toBe(100);
    expect(getExamReviewCompletionRate(-1, 7)).toBe(0);
  });

  test('관리자에게 귀속된 처리 건수의 1인당 평균을 올림한다', () => {
    const managers: ExamReviewAdminStatusManager[] = [
      {
        encryptedAdminId: 'admin-1',
        nickname: '관리자A',
        processedCount: 4,
      },
      {
        encryptedAdminId: 'admin-2',
        nickname: '관리자B',
        processedCount: 3,
      },
    ];

    expect(getAverageProcessedCount(managers)).toBe(4);
    expect(getAverageProcessedCount([])).toBeNull();
  });

  test('진행 중, 최근 종료, 가장 가까운 예정 순서로 기본 기간을 선택한다', () => {
    const endedPeriod = createPeriod(
      1,
      '2026-04-01T00:00:00',
      '2026-04-30T23:59:00'
    );
    const activePeriod = createPeriod(
      2,
      '2026-08-01T00:00:00',
      '2026-08-31T23:59:00'
    );
    const futurePeriod = createPeriod(
      3,
      '2026-10-01T00:00:00',
      '2026-10-31T23:59:00'
    );

    expect(
      getDefaultAdminStatusPeriod(
        [endedPeriod, futurePeriod, activePeriod],
        new Date('2026-08-22T12:00:00')
      )?.id
    ).toBe(2);
    expect(
      getDefaultAdminStatusPeriod(
        [endedPeriod, futurePeriod],
        new Date('2026-08-22T12:00:00')
      )?.id
    ).toBe(1);
    expect(
      getDefaultAdminStatusPeriod(
        [futurePeriod],
        new Date('2026-08-22T12:00:00')
      )?.id
    ).toBe(3);
  });

  test('기간 탭을 시작 일시 내림차순으로 정렬한다', () => {
    const periods = [
      createPeriod(1, '2026-04-01T00:00:00', '2026-04-30T23:59:00'),
      createPeriod(3, '2026-10-01T00:00:00', '2026-10-31T23:59:00'),
      createPeriod(2, '2026-08-01T00:00:00', '2026-08-31T23:59:00'),
    ];

    expect(sortAdminStatusPeriods(periods).map((period) => period.id)).toEqual([
      3, 2, 1,
    ]);
    expect(periods.map((period) => period.id)).toEqual([1, 3, 2]);
  });
});
