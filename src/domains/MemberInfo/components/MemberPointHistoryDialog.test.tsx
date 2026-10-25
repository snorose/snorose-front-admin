import { MemoryRouter } from 'react-router-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import MemberPointHistoryDialog from './MemberPointHistoryDialog';

const mocks = vi.hoisted(() => ({
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  fetching: false,
}));
vi.mock('@/domains/MemberInfo/hooks/useMemberPointHistory', () => ({
  useMemberPointHistory: () => ({
    data: {
      pages: [
        {
          totalCount: 2,
          data: [
            {
              id: 1,
              difference: 10,
              category: 'ETC',
              source: 'ADMIN',
              sourceId: null,
              sourceDetail: null,
              createdAt: '2026-10-01T00:00:00',
            },
          ],
        },
      ],
    },
    fetchNextPage: mocks.fetchNextPage,
    refetch: mocks.refetch,
    hasNextPage: true,
    isError: false,
    isFetchNextPageError: false,
    isFetching: mocks.fetching,
    isFetchingNextPage: mocks.fetching,
    isPaused: false,
    isPending: false,
  }),
}));

const MEMBER: MemberInfo = {
  encryptedUserId: 'encrypted-user-id',
  loginId: 'test-id',
  userName: '테스트',
  email: 'test@sookmyung.ac.kr',
  nickname: '테스터',
  userRoleId: 2,
  studentNumber: '1234567',
  major: '컴퓨터과학전공',
  birthday: '2000-01-01',
  pointBalance: 100,
  createdAt: '2026-01-01T00:00:00',
  authenticatedAt: null,
  currentWarningCount: 0,
  totalWarningCount: 0,
  isBlacklist: false,
  blacklistStartDate: null,
  blacklistEndDate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetching = false;
});

test('본문 스크롤과 더 보기로 다음 페이지를 조회하고 조회 중 중복 실행을 막는다', async () => {
  const user = userEvent.setup();
  const element = (
    <MemoryRouter>
      <MemberPointHistoryDialog member={MEMBER} open onOpenChange={vi.fn()} />
    </MemoryRouter>
  );
  const { rerender } = render(element);
  expect(
    screen.getByRole('dialog', { name: '포인트 증감 히스토리' })
  ).toHaveAccessibleDescription(/전체 포인트 증감 내역/);
  expect(screen.getByText('전체 2건 중 1건')).toBeInTheDocument();
  const body = screen.getByLabelText('포인트 증감 내역');
  Object.defineProperties(body, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 300 },
    scrollTop: { value: 650 },
  });
  fireEvent.scroll(body);
  expect(mocks.fetchNextPage).toHaveBeenCalledExactlyOnceWith({
    cancelRefetch: false,
  });
  await user.click(screen.getByRole('button', { name: '내역 더 보기' }));
  expect(mocks.fetchNextPage).toHaveBeenCalledTimes(2);
  mocks.fetching = true;
  rerender(
    <MemoryRouter>
      <MemberPointHistoryDialog member={MEMBER} open onOpenChange={vi.fn()} />
    </MemoryRouter>
  );
  fireEvent.scroll(body);
  expect(screen.getByRole('button', { name: '불러오는 중...' })).toBeDisabled();
  expect(mocks.fetchNextPage).toHaveBeenCalledTimes(2);
});
