import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { getUserDetailAPI } from '@/apis';

import { MemberInfoPopover } from './MemberInfoPopover';

vi.mock('@/apis', () => ({ getUserDetailAPI: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderAuthor(
  props: Partial<ComponentProps<typeof MemberInfoPopover>> = {}
) {
  return render(
    <MemoryRouter>
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
});

test('공지 작성자 메뉴는 회원 정보·작성한 공지만 제공하고 기존 상세 이동 콜백을 사용한다', async () => {
  const user = userEvent.setup();
  const onViewMemberInfo = vi.fn();
  renderAuthor({
    showSanctionAction: false,
    onViewMemberInfo,
    onViewNotices: vi.fn(),
  });
  await user.click(screen.getByRole('button', { name: '작성자' }));
  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent)
  ).toEqual(['회원 정보', '작성한 공지글']);
  await user.click(screen.getByRole('menuitem', { name: '회원 정보' }));
  expect(onViewMemberInfo).toHaveBeenCalledOnce();
  expect(getUserDetailAPI).not.toHaveBeenCalled();
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
