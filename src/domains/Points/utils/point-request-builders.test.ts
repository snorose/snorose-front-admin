import { describe, expect, test } from 'vitest';

import {
  createExcelPointBulkRewardRequest,
  createPointFreezeRequest,
  updatePointFreezeRequest,
} from './point-request-builders';

describe('createPointFreezeRequest', () => {
  test('포인트 미지급 일정 생성 요청 날짜를 공백 구분 초 단위로 변환한다', () => {
    expect(
      createPointFreezeRequest({
        title: '2026-1 중간고사',
        startAt: '2026-04-01T00:00',
        endAt: '2026-04-10T23:59',
      })
    ).toEqual({
      title: '2026-1 중간고사',
      startAt: '2026-04-01 00:00:00',
      endAt: '2026-04-10 23:59:00',
    });
  });
});

describe('updatePointFreezeRequest', () => {
  test('포인트 미지급 일정 수정 요청 날짜를 공백 구분 초 단위로 변환한다', () => {
    expect(
      updatePointFreezeRequest({
        title: '2026-1 기말고사',
        startAt: '2026-06-01T00:00',
        endAt: '2026-06-10T23:59',
      })
    ).toEqual({
      title: '2026-1 기말고사',
      startAt: '2026-06-01 00:00:00',
      endAt: '2026-06-10 23:59:00',
    });
  });
});

describe('createExcelPointBulkRewardRequest', () => {
  test('즉시 지급 요청에는 예약 일시를 포함하지 않는다', () => {
    expect(
      createExcelPointBulkRewardRequest({
        bulkMemo: '일괄 지급',
        isReservation: false,
        reservationDateTime: '',
      })
    ).toEqual({
      paymentMethod: 'IMMEDIATE',
      bulkMemo: '일괄 지급',
    });
  });

  test('예약 지급 요청에는 예약 일시를 공백 구분 초 단위로 포함한다', () => {
    expect(
      createExcelPointBulkRewardRequest({
        bulkMemo: '예약 지급',
        isReservation: true,
        reservationDateTime: '2026-04-01T09:30',
      })
    ).toEqual({
      paymentMethod: 'RESERVED',
      bulkMemo: '예약 지급',
      reservedAt: '2026-04-01 09:30:00',
    });
  });
});
