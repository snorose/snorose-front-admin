import { beforeEach, describe, expect, test } from 'vitest';

import {
  createMockExamReviewAdminStatusPeriod,
  deleteMockExamReviewAdminStatusPeriod,
  getMockExamReviewAdminStatus,
  getMockExamReviewAdminStatusPeriods,
  resetMockExamReviewAdminStatusPeriods,
  updateMockExamReviewAdminStatusPeriod,
} from './exam-admin-status';

describe('시험후기 담당 관리자 현황 mock 서비스', () => {
  beforeEach(() => {
    resetMockExamReviewAdminStatusPeriods();
  });

  test('커스텀 기간 범위에 포함된 시험후기 현황을 계산한다', async () => {
    const period = await createMockExamReviewAdminStatusPeriod({
      title: '4월 1주차',
      startAt: '2026-04-01T00:00:00',
      endAt: '2026-04-10T23:59:00',
    });
    const result = await getMockExamReviewAdminStatus(period.id);

    expect(result.summary).toEqual({
      totalCount: 2,
      confirmedCount: 2,
      unconfirmedCount: 0,
      unassignedCount: 0,
    });
    expect(result.managers).toEqual([
      {
        encryptedAdminId: 'encrypted-admin-main',
        nickname: '관리자A',
        processedCount: 2,
      },
    ]);
  });

  test('기간을 추가·수정·삭제하고 목록에 반영한다', async () => {
    const createdPeriod = await createMockExamReviewAdminStatusPeriod({
      title: '커스텀 기간',
      startAt: '2026-09-01T00:00:00',
      endAt: '2026-09-30T23:59:00',
    });

    const updatedPeriod = await updateMockExamReviewAdminStatusPeriod({
      periodId: createdPeriod.id,
      input: {
        title: '수정된 커스텀 기간',
        startAt: '2026-09-05T00:00:00',
        endAt: '2026-09-25T23:59:00',
      },
    });

    expect(updatedPeriod.title).toBe('수정된 커스텀 기간');

    await deleteMockExamReviewAdminStatusPeriod(createdPeriod.id);
    const periods = await getMockExamReviewAdminStatusPeriods();

    expect(periods).not.toContainEqual(
      expect.objectContaining({ id: createdPeriod.id })
    );
  });
});
