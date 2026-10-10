import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import { searchUsersAPI } from '@/apis';

import MemberPenaltyManagementPage from './MemberPenaltyManagementPage';

vi.mock('@/apis', () => ({
  getUserDetailAPI: vi.fn(),
  searchUsersAPI: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { info: vi.fn(), error: vi.fn() },
}));

vi.mock('@/domains/MemberInfo', () => ({
  BlacklistHistoryTab: () => null,
  PenaltyUserInfoView: ({ member }: { member: MemberInfo | null }) => (
    <div>{member?.userName}</div>
  ),
  TabList: () => null,
  getPenaltyTabs: () => [],
}));

const member = {
  encryptedUserId: 'member-1',
  loginId: 'testuser',
  userName: '테스트 회원',
  studentNumber: '20260001',
  userRoleId: 1,
  totalWarningCount: 0,
  isBlacklist: false,
  blacklistStartDate: null,
  blacklistEndDate: null,
} as MemberInfo;

describe('경고 및 강등 관리 회원 검색', () => {
  beforeEach(() => vi.clearAllMocks());

  test('Enter로 검색하고 응답 대기 중에는 중복 제출을 막는다', async () => {
    let resolveSearch!: (value: MemberInfo) => void;
    vi.mocked(searchUsersAPI).mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      })
    );
    const user = userEvent.setup();
    render(<MemberPenaltyManagementPage />);

    const input = screen.getByRole('textbox', {
      name: '회원 검색 (아이디 또는 학번)',
    });
    await user.type(input, '  TestUser{Enter}');

    expect(searchUsersAPI).toHaveBeenCalledExactlyOnceWith('testuser');
    const button = screen.getByRole('button', { name: '검색 중...' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'default');

    resolveSearch(member);
    expect(await screen.findByText('테스트 회원')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '검색' })).toBeEnabled()
    );
  });

  test('빈 검색어는 API를 호출하지 않고 안내한다', async () => {
    const user = userEvent.setup();
    render(<MemberPenaltyManagementPage />);

    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(searchUsersAPI).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('검색어를 입력해주세요.');
  });
});
