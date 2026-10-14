import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render as originalRender,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AdminUserListResult } from '@/shared/types';

import { getAllUsersAPI } from '@/apis';

import MemberInfoPage from './MemberInfoPage';

function render(element: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return originalRender(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>
  );
}

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getAllUsersAPI: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const listResponse = (totalCount: number): AdminUserListResult => ({
  data: [],
  totalCount,
  totalPage: 1,
  hasNext: false,
});

function createDeferredResponse() {
  let resolve!: (value: AdminUserListResult) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<AdminUserListResult>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe('회원 목록 헤더', () => {
  test('등급에는 검색창을 표시하지 않고 전공·입학연도 검색을 유지한다', async () => {
    const user = userEvent.setup();
    vi.mocked(getAllUsersAPI).mockResolvedValue(listResponse(0));
    render(
      <MemoryRouter initialEntries={['/member/info']}>
        <MemberInfoPage />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: '등급' }));
    expect(
      screen.queryByRole('textbox', { name: '등급 목록 검색' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '정회원' }));
    expect(screen.getByRole('button', { name: '등급' })).toHaveTextContent(
      '정회원'
    );
    await user.click(screen.getByRole('button', { name: '전공' }));
    expect(
      screen.getByRole('textbox', { name: '전공 목록 검색' })
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: '입학연도' }));
    expect(
      screen.getByRole('textbox', { name: '입학연도 목록 검색' })
    ).toBeInTheDocument();
  });

  test('적용된 검색의 개수를 표시하고 검색·실패·재조회 상태를 반영한다', async () => {
    const user = userEvent.setup();
    const initialResponse = createDeferredResponse();
    vi.mocked(getAllUsersAPI).mockReturnValueOnce(initialResponse.promise);
    render(
      <MemoryRouter initialEntries={['/member/info']}>
        <MemberInfoPage />
      </MemoryRouter>
    );

    const region = screen.getByRole('region', { name: '회원 목록' });
    expect(within(region).getAllByRole('heading', { level: 2 })).toHaveLength(
      1
    );
    const status = within(region).getByText('조회 중…');
    expect(status).toHaveAttribute('role', 'status');
    expect(status).not.toHaveTextContent('총 0건');

    await act(async () => initialResponse.resolve(listResponse(1234)));
    await waitFor(() => expect(status).toHaveTextContent('총 1,234건'));
    expect(screen.getAllByText('1,234')).toHaveLength(1);

    await user.type(
      screen.getByRole('textbox', { name: '회원 검색어' }),
      '회원'
    );
    expect(status).toHaveTextContent('총 1,234건');
    expect(getAllUsersAPI).toHaveBeenCalledTimes(1);

    const searchResponse = createDeferredResponse();
    vi.mocked(getAllUsersAPI).mockReturnValueOnce(searchResponse.promise);
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(status).toHaveTextContent('조회 중…');
    expect(status).not.toHaveTextContent('1,234');
    expect(getAllUsersAPI).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, keyword: '회원' })
    );

    await act(async () => searchResponse.reject(new Error('조회 실패')));
    await waitFor(() => expect(status).toHaveTextContent('개수 확인 불가'));

    const retryResponse = createDeferredResponse();
    vi.mocked(getAllUsersAPI).mockReturnValueOnce(retryResponse.promise);
    await user.click(screen.getByRole('button', { name: '보유 포인트 정렬' }));
    expect(status).toHaveTextContent('조회 중…');

    await act(async () => retryResponse.resolve(listResponse(0)));
    await waitFor(() => expect(status).toHaveTextContent('총 0건'));
    for (const name of ['포인트 지급', '제재 부여', '회원 탈퇴', '알림 전송']) {
      expect(within(region).getByRole('button', { name })).toBeDisabled();
    }
  });
});
