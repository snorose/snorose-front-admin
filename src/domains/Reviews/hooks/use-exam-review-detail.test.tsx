import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExamReviewDetailResult } from '@/domains/Reviews/types';

import { getExamReviewDetail } from '@/apis';

import { examReviewDetailQueryKey } from './exam-review-query-keys';
import { useExamReviewDetail } from './use-exam-review-detail';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getExamReviewDetail: vi.fn(),
}));

const detail: ExamReviewDetailResult = {
  encryptedUserId: 'encrypted-user-id',
  userDisplay: '익명',
  postId: 101,
  title: '운영체제 중간고사',
  commentCount: 0,
  status: 'UNCONFIRMED',
  createdAt: '2026-04-20T10:00:00',
  lectureName: '운영체제',
  professor: '김교수',
  classNumber: 1,
  lectureYear: 2026,
  semester: 'FIRST',
  lectureType: 'MAJOR_REQUIRED',
  isPF: false,
  isOnline: false,
  examType: 'MIDTERM',
  isConfirmed: false,
  isDiscussed: false,
  deletionStatus: null,
  isSanctioned: false,
  visibilityStatus: null,
  memo: null,
  fileName: 'exam.pdf',
  questionDetail: '서술형 3문항',
  logs: [],
};

function renderDetail(postId: number | null) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 5 * 60 * 1000, gcTime: 0 },
    },
  });
  const hook = renderHook(
    ({ id }: { id: number | null }) => useExamReviewDetail(id),
    {
      initialProps: { id: postId },
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    }
  );
  return { ...hook, client };
}

describe('시험 후기 상세 Query', () => {
  beforeEach(() => vi.resetAllMocks());

  test('선택 전에는 조회하지 않고, 다시 선택하면 전역 staleTime에 따라 캐시를 사용한다', async () => {
    vi.mocked(getExamReviewDetail).mockResolvedValue(detail);
    const { result, rerender } = renderDetail(null);
    expect(getExamReviewDetail).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    rerender({ id: detail.postId });
    await waitFor(() => expect(result.current.data).toEqual(detail));
    rerender({ id: null });
    expect(result.current.data).toBeUndefined();
    rerender({ id: detail.postId });
    expect(result.current.data).toEqual(detail);
    expect(getExamReviewDetail).toHaveBeenCalledTimes(1);
  });

  test('이전 선택의 늦은 응답이 현재 선택한 상세를 덮어쓰지 않는다', async () => {
    let resolve!: (value: ExamReviewDetailResult) => void;
    vi.mocked(getExamReviewDetail).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      })
    );
    const nextDetail = { ...detail, postId: detail.postId + 1 };
    vi.mocked(getExamReviewDetail).mockResolvedValueOnce(nextDetail);
    const { result, rerender, client } = renderDetail(detail.postId);
    expect(result.current.isLoading).toBe(true);
    rerender({ id: nextDetail.postId });
    await waitFor(() => expect(result.current.data).toEqual(nextDetail));
    await act(async () => {
      resolve(detail);
    });
    await waitFor(() =>
      expect(
        client.getQueryData(examReviewDetailQueryKey(detail.postId))
      ).toEqual(detail)
    );
    expect(result.current.data).toEqual(nextDetail);
  });

  test('실패 후 다시 조회하면 상세 정보를 복구한다', async () => {
    vi.mocked(getExamReviewDetail)
      .mockRejectedValueOnce(new Error('조회 실패'))
      .mockResolvedValueOnce(detail);
    const { result } = renderDetail(detail.postId);
    await waitFor(() => expect(result.current.isError).toBe(true));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toEqual(detail));
    expect(result.current.isError).toBe(false);
  });

  test('캐시 무효화 시 5분이 지나지 않아도 상세 정보를 갱신한다', async () => {
    vi.mocked(getExamReviewDetail).mockResolvedValueOnce(detail);
    const { result, client } = renderDetail(detail.postId);
    await waitFor(() => expect(result.current.data).toEqual(detail));
    const updated = { ...detail, fileName: 'renamed.pdf' };
    vi.mocked(getExamReviewDetail).mockResolvedValueOnce(updated);
    await act(async () => {
      await client.invalidateQueries({
        queryKey: examReviewDetailQueryKey(detail.postId),
      });
    });
    await waitFor(() => expect(result.current.data).toEqual(updated));
    expect(getExamReviewDetail).toHaveBeenCalledTimes(2);
  });
});
