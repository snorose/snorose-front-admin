import { MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import ExamTable from '@/domains/Reviews/components/ExamTable';

import { getExamReviews } from '@/apis';

import ExamReviewPage from './ExamReviewPage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getExamReviews: vi.fn(),
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

describe('시험후기 목록 헤더', () => {
  test('제목을 한 번 표시하고 최초 조회·재조회·오류·빈 결과를 반영한다', async () => {
    const initialResponse = createDeferredResponse();
    vi.mocked(getExamReviews).mockReturnValueOnce(initialResponse.promise);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reviews/exam']}>
          <ExamReviewPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const region = screen.getByRole('region', { name: '시험후기 목록' });
    expect(within(region).getAllByRole('heading', { level: 2 })).toHaveLength(
      1
    );
    const status = within(region).getByRole('status');
    expect(status).toHaveTextContent('조회 중…');

    await act(async () => initialResponse.resolve(listResponse(1234)));
    await waitFor(() => expect(status).toHaveTextContent('총 1,234건'));
    expect(screen.getAllByText('1,234')).toHaveLength(1);

    const refreshedResponse = createDeferredResponse();
    vi.mocked(getExamReviews).mockReturnValueOnce(refreshedResponse.promise);
    act(() => {
      void queryClient.invalidateQueries({ queryKey: ['examReviews'] });
    });

    await waitFor(() => expect(status).toHaveTextContent('조회 중…'));
    expect(status).not.toHaveTextContent('1,234');

    await act(async () => refreshedResponse.reject(new Error('조회 실패')));
    await waitFor(() => expect(status).toHaveTextContent('개수 확인 불가'));
    expect(status).not.toHaveTextContent('1,234');

    vi.mocked(getExamReviews).mockResolvedValueOnce(listResponse(0));
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['examReviews'] });
    });
    await waitFor(() => expect(status).toHaveTextContent('총 0건'));
    queryClient.clear();
  });

  test('data prop으로 조회를 끄면 기존 캐시의 총개수 대신 미조회 값을 표시한다', async () => {
    vi.mocked(getExamReviews).mockClear();
    vi.mocked(getExamReviews).mockResolvedValueOnce(listResponse(1234));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <ExamTable />
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('총 1,234건')
    );

    rerender(
      <QueryClientProvider client={queryClient}>
        <ExamTable data={[]} />
      </QueryClientProvider>
    );

    expect(screen.getByRole('status')).toHaveTextContent('총 -건');
    expect(screen.getByRole('status')).not.toHaveTextContent('총 0건');
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['examReviews'] });
    });
    expect(getExamReviews).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('총 -건');
    queryClient.clear();
  });
});
