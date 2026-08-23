import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import { editUsersAPI, getUserDetailAPI } from '@/apis';

import { useMemberDetailState } from './useMemberDetailState';

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/apis', () => ({
  blacklistHistoryAPI: vi.fn(),
  editUsersAPI: vi.fn(),
  getUserDetailAPI: vi.fn(),
}));

const MEMBER: MemberInfo = {
  encryptedUserId: 'encrypted-user-id',
  loginId: 'original-id',
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
  totalWarningCount: 0,
  isBlacklist: false,
  blacklistStartDate: null,
  blacklistEndDate: null,
};

describe('useMemberDetailState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('수정 성공 후 상세 API를 다시 호출하고 서버 응답을 화면에 반영한다', async () => {
    const serverMember = { ...MEMBER, loginId: 'server-normalized-id' };
    vi.mocked(getUserDetailAPI)
      .mockResolvedValueOnce(MEMBER)
      .mockResolvedValueOnce(serverMember);
    vi.mocked(editUsersAPI).mockResolvedValue();

    const loadMembers = vi.fn().mockResolvedValue(undefined);
    const updateCachedMember = vi.fn();
    const { result } = renderHook(() =>
      useMemberDetailState({
        currentPage: 2,
        loadMembers,
        memberKey: MEMBER.encryptedUserId,
        updateCachedMember,
      })
    );

    await waitFor(() => {
      expect(result.current.selectedMember).toEqual(MEMBER);
    });

    act(() => result.current.setIsEdit(true));
    await act(async () => {
      await result.current.handleSaveEdit({ loginId: 'requested-id' });
    });

    expect(editUsersAPI).toHaveBeenCalledWith(MEMBER.encryptedUserId, {
      loginId: 'requested-id',
    });
    expect(getUserDetailAPI).toHaveBeenNthCalledWith(2, MEMBER.encryptedUserId);
    expect(result.current.selectedMember).toEqual(serverMember);
    expect(updateCachedMember).toHaveBeenCalledWith(serverMember);
    expect(loadMembers).toHaveBeenCalledWith(2);
    expect(result.current.isEdit).toBe(false);
  });
});
