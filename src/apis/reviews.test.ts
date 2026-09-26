import { beforeEach, describe, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/shared/axios/instance';

import {
  downloadExamReviewFile,
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
