import { MemoryRouter } from 'react-router-dom';

import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import type { AdminUserListResult } from '@/shared/types';

import { getAllUsersAPI } from '@/apis';

import MemberInfoPage from './MemberInfoPage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getAllUsersAPI: vi.fn(),
}));

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
