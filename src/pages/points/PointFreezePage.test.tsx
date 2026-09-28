import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PointFreeze } from '@/shared/types';

import { getPointFreezesAPI } from '@/apis';

import PointFreezePage from './PointFreezePage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getPointFreezesAPI: vi.fn(),
}));

const period: PointFreeze = {
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
      <PointFreezePage />
    </QueryClientProvider>
  );
  return client;
}

describe('포인트 미지급 일정 Query 조회', () => {
  beforeEach(() => vi.clearAllMocks());

  test('초기 조회 중에는 빈 목록 대신 로딩을 표시하고 응답 후 기간을 표시한다', async () => {
    let resolve!: (periods: PointFreeze[]) => void;
    vi.mocked(getPointFreezesAPI).mockReturnValue(
      new Promise((result) => {
        resolve = result;
      })
    );
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent(
      '미지급 일정을 불러오는 중입니다.'
    );
    expect(
      screen.queryByText('등록된 일정이 없습니다.')
    ).not.toBeInTheDocument();
    resolve([period]);
    expect(
      await screen.findByRole('cell', { name: period.title })
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('조회 실패를 빈 목록과 구분하고 다시 시도하면 목록을 복구한다', async () => {
    vi.mocked(getPointFreezesAPI)
      .mockRejectedValueOnce(new Error('조회 실패'))
      .mockResolvedValueOnce([period]);
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('조회 실패');
    expect(
      screen.queryByText('등록된 일정이 없습니다.')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(
      await screen.findByRole('cell', { name: period.title })
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
