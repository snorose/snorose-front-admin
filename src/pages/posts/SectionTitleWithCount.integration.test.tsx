import { MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getCommentChildrenList, searchComments, searchPosts } from '@/apis';

import PostCommentPage from './PostCommentPage';
import PostManagePage from './PostManagePage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  searchPosts: vi.fn(),
  searchComments: vi.fn(),
  getCommentChildrenList: vi.fn(),
}));

const listResponse = (totalCount: number) => ({
  data: [],
  totalCount,
  totalPage: 1,
  hasNext: false,
});

function createDeferredResponse() {
  let resolve!: (value: ReturnType<typeof listResponse>) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<ReturnType<typeof listResponse>>(
    (onResolve, onReject) => {
      resolve = onResolve;
      reject = onReject;
    }
  );
  return { promise, resolve, reject };
}

const cases = [
  {
    title: '게시글 목록',
    path: '/posts/manage',
    Page: PostManagePage,
    request: vi.mocked(searchPosts),
    queryKey: ['posts'],
  },
  {
    title: '댓글 목록',
    path: '/posts/comments',
    Page: PostCommentPage,
    request: vi.mocked(searchComments),
    queryKey: ['comments'],
  },
  {
    title: '댓글 목록',
    path: '/posts/comments?parentId=42',
    Page: PostCommentPage,
    request: vi.mocked(getCommentChildrenList),
    queryKey: ['comments'],
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe.each(cases)(
  '$path 목록 헤더',
  ({ title, path, Page, request, queryKey }) => {
    test('활성 조회의 개수와 상태를 연결하고 재조회 오류에서 이전 숫자를 숨긴다', async () => {
      const initialResponse = createDeferredResponse();
      request.mockReturnValueOnce(initialResponse.promise);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[path]}>
            <Page />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const region = screen.getByRole('region', { name: title });
      expect(within(region).getAllByRole('heading', { level: 2 })).toHaveLength(
        1
      );
      const status = within(region).getByText('조회 중…');
      expect(status).toHaveAttribute('role', 'status');
      expect(status).toHaveTextContent('조회 중…');
      expect(status).not.toHaveTextContent('총 0건');

      await act(async () => initialResponse.resolve(listResponse(1234)));

      await waitFor(() => expect(status).toHaveTextContent('총 1,234건'));
      expect(screen.getAllByText('1,234')).toHaveLength(1);
      if (path.includes('parentId')) {
        expect(getCommentChildrenList).toHaveBeenCalledWith(42, 0);
        expect(searchComments).not.toHaveBeenCalled();
      } else if (path.includes('comments')) {
        expect(searchComments).toHaveBeenCalled();
        expect(getCommentChildrenList).not.toHaveBeenCalled();
      }

      const refreshedResponse = createDeferredResponse();
      request.mockReturnValueOnce(refreshedResponse.promise);
      act(() => {
        void queryClient.invalidateQueries({ queryKey });
      });

      await waitFor(() => expect(status).toHaveTextContent('조회 중…'));
      expect(status).not.toHaveTextContent('1,234');

      await act(async () => refreshedResponse.reject(new Error('조회 실패')));

      await waitFor(() => expect(status).toHaveTextContent('개수 확인 불가'));
      expect(status).not.toHaveTextContent('1,234');

      request.mockResolvedValueOnce(listResponse(0));
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey });
      });

      await waitFor(() => expect(status).toHaveTextContent('총 0건'));
      queryClient.clear();
    });
  }
);
