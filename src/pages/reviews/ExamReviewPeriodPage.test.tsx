import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExamReviewPeriod } from '@/shared/types';

import { getExamReviewPeriodsAPI } from '@/apis';

import ExamReviewPeriodPage from './ExamReviewPeriodPage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getExamReviewPeriodsAPI: vi.fn(),
}));

// 기존 폼의 변경 성공 콜백을 통해 목록 재조회를 검증합니다.
vi.mock('@/domains/Reviews/components/ExamReviewPeriodScheduleForm', () => ({
  ExamReviewPeriodScheduleForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess}>테스트 변경 완료</button>
  ),
}));

const period: ExamReviewPeriod = {
  id: 1,
  title: '중간고사 작성 기간',
  startAt: '2026-10-10 00:00:00',
  endAt: '2026-10-17 23:59:00',
  createdAt: '2026-09-27 00:00:00',
  updatedAt: '2026-09-27 00:00:00',
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={client}>
      <ExamReviewPeriodPage />
    </QueryClientProvider>
  );
  return client;
}

describe('시험후기 작성 기간 Query 조회', () => {
  beforeEach(() => vi.clearAllMocks());

  test('초기 조회 중에는 빈 목록 대신 로딩을 표시하고 응답 후 기간을 표시한다', async () => {
    let resolve!: (periods: ExamReviewPeriod[]) => void;
    vi.mocked(getExamReviewPeriodsAPI).mockReturnValue(
      new Promise((result) => {
        resolve = result;
      })
    );
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent(
      '작성 기간을 불러오는 중입니다.'
    );
    expect(
      screen.queryByText('등록된 기간이 없습니다.')
    ).not.toBeInTheDocument();
    resolve([period]);
    expect(
      await screen.findByRole('cell', { name: period.title })
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('조회 실패를 빈 목록과 구분하고 다시 시도하면 목록을 복구한다', async () => {
    vi.mocked(getExamReviewPeriodsAPI)
      .mockRejectedValueOnce(new Error('조회 실패'))
      .mockResolvedValueOnce([period]);
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('조회 실패');
    expect(
      screen.queryByText('등록된 기간이 없습니다.')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(
      await screen.findByRole('cell', { name: period.title })
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('변경 성공 콜백에서 캐시를 갱신하여 새 목록을 표시한다', async () => {
    vi.mocked(getExamReviewPeriodsAPI)
      .mockResolvedValueOnce([period])
      .mockResolvedValueOnce([]);
    renderPage();
    await screen.findByRole('cell', { name: period.title });
    fireEvent.click(screen.getByRole('button', { name: '테스트 변경 완료' }));
    expect(
      await screen.findByText('등록된 기간이 없습니다.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: period.title })
    ).not.toBeInTheDocument();
    expect(getExamReviewPeriodsAPI).toHaveBeenCalledTimes(2);
  });

  test('갱신 실패 시 기존 기간을 유지하고 오류와 재시도를 표시한다', async () => {
    vi.mocked(getExamReviewPeriodsAPI)
      .mockResolvedValueOnce([period])
      .mockRejectedValueOnce(new Error('갱신 실패'));
    renderPage();
    await screen.findByRole('cell', { name: period.title });
    fireEvent.click(screen.getByRole('button', { name: '테스트 변경 완료' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('갱신 실패');
    expect(
      screen.getByRole('cell', { name: period.title })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeEnabled()
    );
  });
});
