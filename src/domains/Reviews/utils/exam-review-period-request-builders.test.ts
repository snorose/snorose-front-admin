import { describe, expect, test } from 'vitest';

import {
  createExamReviewPeriodRequest,
  updateExamReviewPeriodRequest,
} from './exam-review-period-request-builders';

describe('createExamReviewPeriodRequest', () => {
  test('시험후기 작성 기간 생성 요청 날짜를 T 구분 초 단위로 변환한다', () => {
    expect(
      createExamReviewPeriodRequest({
        title: '2026-1 중간고사',
        startAt: '2026-04-01T00:00',
        endAt: '2026-04-10T23:59',
      })
    ).toEqual([
      {
        title: '2026-1 중간고사',
        startAt: '2026-04-01T00:00:00',
        endAt: '2026-04-10T23:59:00',
      },
    ]);
  });
});

describe('updateExamReviewPeriodRequest', () => {
  test('시험후기 작성 기간 수정 요청 날짜를 T 구분 초 단위로 변환한다', () => {
    expect(
      updateExamReviewPeriodRequest({
        title: '2026-1 기말고사',
        startAt: '2026-06-01T00:00',
        endAt: '2026-06-10T23:59',
      })
    ).toEqual({
      title: '2026-1 기말고사',
      startAt: '2026-06-01T00:00:00',
      endAt: '2026-06-10T23:59:00',
    });
  });
});
