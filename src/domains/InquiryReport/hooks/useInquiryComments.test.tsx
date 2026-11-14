import type { PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import type { InquiryComment } from '@/shared/types';

import { getAdminInquiryCommentsAPI } from '@/apis/inquiries';

import { useInquiryComments } from './useInquiryComments';

vi.mock('@/apis/inquiries', () => ({ getAdminInquiryCommentsAPI: vi.fn() }));

const comment: InquiryComment = {
  id: 1,
  postId: 10,
  userRoleId: 1,
  userDisplay: '관리자',
  isWriter: true,
  isWriterWithdrawn: false,
  content: '첫 페이지 댓글',
  createdAt: '2026-11-14T12:00:00',
  updatedAt: null,
  isVisible: true,
  isUpdated: false,
  isDeleted: false,
  children: [],
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => vi.resetAllMocks());

test('다음 페이지의 새 댓글과 대댓글도 기존 댓글 순서대로 표시한다', async () => {
  const next = {
    ...comment,
    id: 2,
    content: '새 댓글',
    children: [{ ...comment, id: 3, content: '대댓글' }],
  };
  vi.mocked(getAdminInquiryCommentsAPI)
    .mockResolvedValueOnce({ hasNext: true, data: [comment] })
    .mockResolvedValueOnce({ hasNext: false, data: [comment, next] });
  const { result } = renderHook(() => useInquiryComments(10), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({
    hasNext: false,
    data: [comment, next],
  });
  expect(getAdminInquiryCommentsAPI).toHaveBeenNthCalledWith(
    2,
    10,
    { page: 1 },
    expect.anything()
  );
});

test('다음 페이지 조회 실패를 일부 댓글만 있는 성공 결과로 처리하지 않는다', async () => {
  vi.mocked(getAdminInquiryCommentsAPI)
    .mockResolvedValueOnce({ hasNext: true, data: [comment] })
    .mockRejectedValueOnce(new Error('다음 페이지 실패'));
  const { result } = renderHook(() => useInquiryComments(10), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});

test('서버가 같은 페이지를 반복하면 조회를 중단한다', async () => {
  vi.mocked(getAdminInquiryCommentsAPI).mockResolvedValue({
    hasNext: true,
    data: [comment],
  });
  const { result } = renderHook(() => useInquiryComments(10), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(getAdminInquiryCommentsAPI).toHaveBeenCalledTimes(2);
});

test('상세를 전환하면 이전 댓글 요청을 취소하고 새 글의 댓글만 표시한다', async () => {
  let previousSignal: AbortSignal | undefined;
  vi.mocked(getAdminInquiryCommentsAPI).mockImplementation(
    (postId, _, signal) => {
      if (postId === 10) {
        previousSignal = signal;
        return new Promise((_, reject) =>
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
        );
      }
      return Promise.resolve({
        hasNext: false,
        data: [{ ...comment, postId }],
      });
    }
  );
  const { result, rerender } = renderHook(
    ({ postId }) => useInquiryComments(postId),
    { wrapper: createWrapper(), initialProps: { postId: 10 } }
  );
  await waitFor(() => expect(previousSignal).toBeDefined());
  rerender({ postId: 20 });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(previousSignal?.aborted).toBe(true);
  expect(result.current.data?.data[0].postId).toBe(20);
});
