import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { AdminUserListItem } from '@/shared/types';

import { useMemberDirectoryState } from '@/domains/MemberInfo/hooks/useMemberDirectoryState';

import {
  getAllUsersAPI,
  postSinglePointAPI,
  searchSinglePointMemberAPI,
} from '@/apis';
import { postAllMemberPointAPI } from '@/apis/points';

import AdjustAllMemberPointPage from './AdjustAllMemberPointPage';
import AdjustSinglePointPage from './AdjustSinglePointPage';

vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  getAllUsersAPI: vi.fn(),
  postSinglePointAPI: vi.fn(),
  searchSinglePointMemberAPI: vi.fn(),
}));
vi.mock('@/apis/points', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis/points')>()),
  postAllMemberPointAPI: vi.fn(),
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const member: AdminUserListItem = {
  encryptedUserId: 'encrypted-member',
  loginId: 'member-login',
  userName: '회원',
  nickname: '눈송',
  email: 'member@sookmyung.ac.kr',
  studentNumber: '2600001',
  major: '컴퓨터과학전공',
  userRoleId: 2,
  userRoleName: '정회원',
  pointBalance: 100,
  createdAt: '2026-01-01',
  authenticatedAt: null,
};
let balance = member.pointBalance;

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});

beforeEach(() => {
  vi.resetAllMocks();
  balance = member.pointBalance;
  vi.mocked(getAllUsersAPI).mockImplementation(async () => ({
    data: [{ ...member, pointBalance: balance }],
    totalCount: 1,
    totalPage: 1,
    hasNext: false,
  }));
  vi.mocked(searchSinglePointMemberAPI).mockResolvedValue(member);
  vi.mocked(postSinglePointAPI).mockImplementation(
    async ({ difference = 0 }) => {
      balance += difference;
    }
  );
  vi.mocked(postAllMemberPointAPI).mockImplementation(
    async ({ difference }) => {
      balance += difference;
    }
  );
});

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return { client, wrapper };
}

async function submitAdjustment(
  target: '단일건' | '전체',
  difference: number,
  wrapper: ReturnType<typeof createWrapper>['wrapper']
) {
  const user = userEvent.setup();
  const page = render(
    target === '단일건' ? (
      <AdjustSinglePointPage />
    ) : (
      <AdjustAllMemberPointPage />
    ),
    { wrapper }
  );
  if (target === '단일건') {
    await user.type(
      screen.getByLabelText('회원 검색 (아이디 또는 학번)'),
      member.loginId
    );
    await user.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() =>
      expect(screen.getByLabelText(/회원 ID/)).toHaveValue(
        member.encryptedUserId
      )
    );
  }
  await user.click(screen.getByRole('combobox', { name: /포인트 유형/ }));
  await user.click(screen.getByRole('option', { name: '기타' }));
  await user.type(
    screen.getByLabelText(/포인트 지급\/차감량/),
    String(difference)
  );
  await user.type(screen.getByLabelText(/메모/), '포인트 조정');
  await user.click(screen.getByRole('button', { name: '적용' }));
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: '확인' })
  );
  return page;
}

test.each([
  ['단일건', 20],
  ['단일건', -20],
  ['전체', 20],
  ['전체', -20],
] as const)(
  '%s 포인트 조정(%s) 후 5분 안에 목록에 재진입해도 최신 잔액을 조회한다',
  async (target, difference) => {
    const { client, wrapper } = createWrapper();
    const directory = renderHook(() => useMemberDirectoryState(false), {
      wrapper,
    });
    await waitFor(() =>
      expect(directory.result.current.members[0]?.pointBalance).toBe(100)
    );
    act(() => directory.result.current.handleSelectedRoleChange('2'));
    await waitFor(() => expect(getAllUsersAPI).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(directory.result.current.isListLoading).toBe(false)
    );
    directory.unmount();

    const page = await submitAdjustment(target, difference, wrapper);
    await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
    page.unmount();

    const returned = renderHook(() => useMemberDirectoryState(false), {
      wrapper,
    });
    await waitFor(() =>
      expect(returned.result.current.members[0]?.pointBalance).toBe(
        100 + difference
      )
    );
    expect(getAllUsersAPI).toHaveBeenCalledTimes(3);
    act(() => returned.result.current.handleSelectedRoleChange('2'));
    await waitFor(() =>
      expect(returned.result.current.members[0]?.pointBalance).toBe(
        100 + difference
      )
    );
    await waitFor(() =>
      expect(returned.result.current.isListLoading).toBe(false)
    );
    expect(getAllUsersAPI).toHaveBeenCalledTimes(4);
    expect(postSinglePointAPI).toHaveBeenCalledTimes(
      target === '단일건' ? 1 : 0
    );
    expect(postAllMemberPointAPI).toHaveBeenCalledTimes(
      target === '전체' ? 1 : 0
    );
    returned.unmount();
    client.clear();
  }
);

test.each(['단일건', '전체'] as const)(
  '%s 포인트 조정 실패 시 기존 목록 캐시를 유지한다',
  async (target) => {
    const { client, wrapper } = createWrapper();
    const directory = renderHook(() => useMemberDirectoryState(false), {
      wrapper,
    });
    await waitFor(() =>
      expect(directory.result.current.members[0]?.pointBalance).toBe(100)
    );
    directory.unmount();
    vi.mocked(postSinglePointAPI).mockRejectedValueOnce(new Error('지급 실패'));
    vi.mocked(postAllMemberPointAPI).mockRejectedValueOnce(
      new Error('지급 실패')
    );

    const page = await submitAdjustment(target, 20, wrapper);
    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce());
    expect(toast.success).not.toHaveBeenCalled();
    page.unmount();
    const returned = renderHook(() => useMemberDirectoryState(false), {
      wrapper,
    });
    expect(returned.result.current.members[0]?.pointBalance).toBe(100);
    expect(returned.result.current.isListLoading).toBe(false);
    expect(getAllUsersAPI).toHaveBeenCalledTimes(1);
    returned.unmount();
    client.clear();
  }
);
