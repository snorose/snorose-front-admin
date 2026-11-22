import type { ComponentProps } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { getUserDetailAPI } from '@/apis';

import { MemberInfoPopover } from './MemberInfoPopover';

vi.mock('@/apis', () => ({ getUserDetailAPI: vi.fn() }));

beforeEach(() => {
  vi.mocked(getUserDetailAPI).mockResolvedValue({
    encryptedUserId: 'encrypted-author',
    loginId: 'author',
    userName: '김송이',
    email: 'author@example.com',
    nickname: '작성자',
    userRoleId: 4,
    studentNumber: '20260000',
    major: '컴퓨터과학',
    birthday: '2000-01-01',
    pointBalance: 10,
    createdAt: '2026-11-22T00:00:00',
    authenticatedAt: null,
    totalWarningCount: 0,
    isBlacklist: false,
    blacklistStartDate: null,
    blacklistEndDate: null,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function CurrentPath() {
  return <output data-testid='member-path'>{useLocation().pathname}</output>;
}

function renderAuthor(
  props: Partial<ComponentProps<typeof MemberInfoPopover>> = {}
) {
  return render(
    <MemoryRouter>
      <CurrentPath />
      <MemberInfoPopover
        encryptedUserId='encrypted-author'
        displayName='작성자'
        {...props}
      />
    </MemoryRouter>
  );
}

test('기존 게시글·댓글·시험후기의 회원 정보·활동·제재 메뉴를 유지한다', async () => {
  const user = userEvent.setup();
  renderAuthor();
  await user.click(screen.getByRole('button', { name: '작성자' }));
  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent)
  ).toEqual([
    '회원 정보',
    '작성 게시글',
    '작성 댓글',
    '작성 시험후기',
    '제재하기',
  ]);
  expect(getUserDetailAPI).not.toHaveBeenCalled();
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  expect(
    await screen.findByRole('dialog', { name: '회원 정보' })
  ).toHaveTextContent('김송이');
  expect(getUserDetailAPI).toHaveBeenCalledExactlyOnceWith('encrypted-author');
});

test('공지 작성자도 기존 팝업을 먼저 표시하고 팝업의 버튼으로 회원 상세에 이동한다', async () => {
  const user = userEvent.setup();
  const resolveMemberId = vi.fn().mockResolvedValue('resolved-author');
  renderAuthor({
    encryptedUserId: '',
    showSanctionAction: false,
    resolveMemberId,
    onViewNotices: vi.fn(),
  });
  await user.click(screen.getByRole('button', { name: '작성자' }));
  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent)
  ).toEqual(['회원 정보', '작성한 공지글']);
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  const dialog = await screen.findByRole('dialog', { name: '회원 정보' });
  expect(dialog).toHaveTextContent('김송이');
  expect(screen.getByTestId('member-path')).toHaveTextContent(/^\/$/);
  expect(resolveMemberId).toHaveBeenCalledOnce();
  expect(getUserDetailAPI).toHaveBeenCalledExactlyOnceWith('resolved-author');
  await user.click(
    screen.getByRole('button', { name: '유저 상세 페이지로 이동' })
  );
  expect(screen.getByTestId('member-path')).toHaveTextContent(
    '/member/info/resolved-author'
  );
});

test('작성자 ID를 조회하는 동안 버튼을 잠그고 완료 후 해제한다', async () => {
  let complete!: () => void;
  const resolveMemberId = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        complete = () => resolve('resolved-author');
      })
  );
  const user = userEvent.setup();
  renderAuthor({
    encryptedUserId: '',
    showSanctionAction: false,
    resolveMemberId,
    onViewNotices: vi.fn(),
  });
  const trigger = screen.getByRole('button', { name: '작성자' });
  await user.click(trigger);
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  expect(trigger).toBeDisabled();
  expect(trigger).toHaveAttribute('aria-busy', 'true');
  await act(async () => complete());
  await waitFor(() => expect(trigger).toBeEnabled());
  expect(resolveMemberId).toHaveBeenCalledOnce();
  expect(getUserDetailAPI).toHaveBeenCalledExactlyOnceWith('resolved-author');
  expect(screen.getByRole('dialog', { name: '회원 정보' })).toBeInTheDocument();
});

test('회원 조회 실패 시 팝업이나 상세를 열지 않고 다시 조회할 수 있다', async () => {
  const user = userEvent.setup();
  const resolveMemberId = vi
    .fn()
    .mockRejectedValueOnce(new Error('조회 실패'))
    .mockResolvedValue('resolved-author');
  renderAuthor({
    encryptedUserId: '',
    showSanctionAction: false,
    resolveMemberId,
    onViewNotices: vi.fn(),
  });
  await user.click(screen.getByRole('button', { name: '작성자' }));
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '작성자' })).toBeEnabled()
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByTestId('member-path')).toHaveTextContent(/^\/$/);
  await user.click(screen.getByRole('button', { name: '작성자' }));
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  expect(
    await screen.findByRole('dialog', { name: '회원 정보' })
  ).toBeInTheDocument();
});

test('ID가 없는 공지 작성자도 키보드로 공지 필터를 선택하고 메뉴를 닫는다', async () => {
  const user = userEvent.setup();
  const onViewNotices = vi.fn();
  renderAuthor({
    encryptedUserId: '',
    showSanctionAction: false,
    onViewNotices,
  });
  const trigger = screen.getByRole('button', { name: '작성자' });
  trigger.focus();
  await user.keyboard('{ArrowDown}');
  const action = await screen.findByRole('menuitem', { name: '작성한 공지글' });
  expect(screen.getAllByRole('menuitem')).toHaveLength(1);
  expect(action).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(onViewNotices).toHaveBeenCalledOnce();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(getUserDetailAPI).not.toHaveBeenCalled();
});

test('식별 정보와 가능한 동작이 모두 없으면 빈 메뉴 대신 작성자 이름을 표시한다', () => {
  renderAuthor({ encryptedUserId: '' });
  expect(screen.getByText('작성자')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(getUserDetailAPI).not.toHaveBeenCalled();
});
