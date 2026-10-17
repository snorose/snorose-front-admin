import { beforeEach, describe, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import {
  downloadExamReviewFile,
  getExamReviewAdminStatus,
  renameExamReviewFile,
  restoreExamReview,
} from './reviews';

vi.mock('@/shared/axios/instance', () => ({
  axiosInstance: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('시험후기 파일명 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('postId 경로에 newFileName을 전송하고 result를 반환한다', async () => {
    const result = { postId: 101, fileName: '새 이름.pdf', logs: [] };
    vi.mocked(axiosInstance.patch).mockResolvedValue({ data: { result } });

    await expect(renameExamReviewFile(101, '새 이름.pdf')).resolves.toEqual(
      result
    );
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/v1/admin/reviews/101/file-name',
      { newFileName: '새 이름.pdf' }
    );
  });

  test('다운로드 URL의 파일명을 인코딩한다', async () => {
    const blob = new Blob(['file']);
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: blob });

    await expect(downloadExamReviewFile(101, '새 이름.pdf')).resolves.toBe(
      blob
    );
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/v1/reviews/files/101/download/%EC%83%88%20%EC%9D%B4%EB%A6%84.pdf',
      { responseType: 'blob' }
    );
  });
});

describe('시험후기 복구 API', () => {
  test('복구 경로에 POST 요청을 보내고 응답 result를 반환한다', async () => {
    const result = { postId: 1725770 };
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        isSuccess: true,
        code: 1000,
        message: '요청에 성공하였습니다.',
        result,
      },
    });

    await expect(restoreExamReview(1725770)).resolves.toEqual(result);
    expect(axiosInstance.post).toHaveBeenLastCalledWith(
      '/v1/admin/reviews/1725770/restore'
    );
  });
});

describe('시험후기 담당 관리자 통계 API', () => {
  test('상세 조회와 구분된 statics 경로로 기간을 조회하고 result를 반환한다', async () => {
    const result = {
      periodId: 3,
      periodTitle: '어드민',
      startAt: '2026-09-03T00:00:00',
      endAt: '2026-10-12T00:00:00',
      totalCount: 7,
      confirmedCount: 5,
      remainingCount: 2,
      confirmedRate: 71.4,
      averagePerAdmin: 4,
      adminStatics: [
        { encryptedAdminId: 'admin-1', nickname: '리자', processedCount: 4 },
      ],
    };
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: { result } });
    await expect(getExamReviewAdminStatus(3)).resolves.toEqual(result);
    expect(axiosInstance.get).toHaveBeenLastCalledWith(
      '/v1/admin/reviews/statics/3'
    );
  });
});
