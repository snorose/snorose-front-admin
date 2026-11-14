import type { PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import type { InquiryListItem } from '@/shared/types';

import { getAdminInquiriesAPI } from '@/apis/inquiries';

import { useInquiryList } from './useInquiryList';

vi.mock('@/apis/inquiries', () => ({ getAdminInquiriesAPI: vi.fn() }));

const item: InquiryListItem = {
  postId: 1,
  title: '문의',
  encryptedUserId: 'author',
  userLoginId: 'snow',
  createdAt: '2026-11-14T12:00:00',
  updatedAt: null,
  isEdited: false,
  status: 'PENDING',
  group: 'REPORT',
  subGroup: 'USER_REPORT',
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

test('서버 검색·유형·카테고리 조건을 모든 페이지에 동일하게 전달하고 결과를 합친다', async () => {
  vi.mocked(getAdminInquiriesAPI)
    .mockResolvedValueOnce({ hasNext: true, data: [item] })
    .mockResolvedValueOnce({ hasNext: false, data: [{ ...item, postId: 2 }] });
  const filters = {
    searchKey: '20260000',
    group: 'REPORT',
    subGroup: 'USER_REPORT',
  } as const;
  const { result } = renderHook(() => useInquiryList(filters), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.map((row) => row.postId)).toEqual([1, 2]);
  expect(getAdminInquiriesAPI).toHaveBeenNthCalledWith(
    1,
    { ...filters, page: 0 },
    expect.anything()
  );
  expect(getAdminInquiriesAPI).toHaveBeenNthCalledWith(
    2,
    { ...filters, page: 1 },
    expect.anything()
  );
});

test('검색 조건을 바꾸면 이전 전체 목록 조회를 중단하고 새 검색 결과만 표시한다', async () => {
  let previousSignal: AbortSignal | undefined;
  vi.mocked(getAdminInquiriesAPI).mockImplementation((params, signal) => {
    if (params?.searchKey === '이전') {
      previousSignal = signal;
      return new Promise((_, reject) =>
        signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        )
      );
    }
    return Promise.resolve({ hasNext: false, data: [item] });
  });
  const { result, rerender } = renderHook(
    ({ searchKey }) => useInquiryList({ searchKey }),
    {
      wrapper: createWrapper(),
      initialProps: { searchKey: '이전' },
    }
  );
  await waitFor(() => expect(previousSignal).toBeDefined());
  rerender({ searchKey: '새 검색' });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(previousSignal?.aborted).toBe(true);
  expect(result.current.data).toEqual([item]);
});

test('검색의 후속 페이지가 실패하면 부분 결과를 성공한 목록으로 표시하지 않는다', async () => {
  vi.mocked(getAdminInquiriesAPI)
    .mockResolvedValueOnce({ hasNext: true, data: [item] })
    .mockRejectedValueOnce(new Error('다음 페이지 실패'));
  const { result } = renderHook(() => useInquiryList({ searchKey: '검색' }), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});
