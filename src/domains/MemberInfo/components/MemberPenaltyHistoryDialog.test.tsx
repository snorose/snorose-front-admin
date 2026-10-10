import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MemberInfo } from '@/shared/types';

import { warnPenaltyAPI } from '@/apis';

import MemberPenaltyHistoryDialog from './MemberPenaltyHistoryDialog';
import PenaltyHistoryAddDialog from './penalty-history/PenaltyHistoryAddDialog';
import {
  type AddPenaltyMode,
  PENALTY_ADD_BLOCKED_MESSAGE,
} from './penalty-history/penalty-history-add-utils';

vi.mock('@/apis', () => ({ warnPenaltyAPI: vi.fn() }));
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
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

const BLOCKED_MEMBERS: [string, MemberInfo][] = [
  [
    '현재 경고 1회',
    { ...MEMBER, currentWarningCount: 1, totalWarningCount: 1 },
  ],
  [
    '현재 경고 2회',
    { ...MEMBER, currentWarningCount: 2, totalWarningCount: 2 },
  ],
  ['활성 경고', { ...MEMBER, isBlacklist: true, blacklistType: 'WARNING' }],
  ['일반 강등', { ...MEMBER, isBlacklist: true, blacklistType: 'RELEGATION' }],
  ['영구 강등', { ...MEMBER, isBlacklist: true, blacklistType: 'BLACKLIST' }],
  ['강등자 등급', { ...MEMBER, userRoleId: 6 }],
];

const MODES: AddPenaltyMode[] = ['WARNING', 'DEMOTION'];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(warnPenaltyAPI).mockResolvedValue(undefined);
});

function renderHistory(member: MemberInfo) {
  return render(
    <MemberPenaltyHistoryDialog
      hasNext={false}
      histories={[]}
      isLoading={false}
      member={member}
      onLoadMore={vi.fn()}
      onOpenChange={vi.fn()}
      open
      totalCount={0}
    />
  );
}

describe('회원 페이지 제재 추가 제한', () => {
  test.each(BLOCKED_MEMBERS)(
    '%s 회원은 두 종류의 추가를 모두 막는다',
    async (_label, member) => {
      const user = userEvent.setup();
      renderHistory(member);

      expect(screen.getByRole('alert')).toHaveTextContent(
        PENALTY_ADD_BLOCKED_MESSAGE
      );
      for (const name of ['경고 추가', '강등 추가']) {
        const button = screen.getByRole('button', { name });
        expect(button).toBeDisabled();
        await user.click(button);
      }
      expect(screen.queryByLabelText('메모')).not.toBeInTheDocument();
      expect(warnPenaltyAPI).not.toHaveBeenCalled();
    }
  );

  test('과거 누적 경고가 있어도 현재 남은 제재가 없으면 추가할 수 있다', () => {
    renderHistory({
      ...MEMBER,
      totalWarningCount: 4,
      blacklistType: 'WARNING',
    });

    expect(screen.getByRole('button', { name: '경고 추가' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '강등 추가' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test.each(MODES)(
    '제재가 0회인 회원의 %s 최초 부여는 가능하다',
    async (mode) => {
      const user = userEvent.setup();
      const onApplied = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <PenaltyHistoryAddDialog
          member={MEMBER}
          mode={mode}
          onApplied={onApplied}
          onOpenChange={onOpenChange}
        />
      );

      await user.click(
        screen.getByRole('button', {
          name: mode === 'WARNING' ? '경고 추가' : '강등 추가',
        })
      );
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => expect(onApplied).toHaveBeenCalledOnce());
      expect(warnPenaltyAPI).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          encryptedUserId: MEMBER.encryptedUserId,
          type: mode === 'WARNING' ? 'WARNING' : 'RELEGATION',
        })
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  );

  test.each(MODES)(
    '제재가 남은 회원의 %s 입력 팝업이 열려도 부여할 수 없다',
    (mode) => {
      render(
        <PenaltyHistoryAddDialog
          member={{ ...MEMBER, currentWarningCount: 1 }}
          mode={mode}
          onOpenChange={vi.fn()}
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent(
        PENALTY_ADD_BLOCKED_MESSAGE
      );
      expect(
        screen.getByRole('button', {
          name: mode === 'WARNING' ? '경고 추가' : '강등 추가',
        })
      ).toBeDisabled();
      expect(screen.queryByLabelText('메모')).not.toBeInTheDocument();
      expect(warnPenaltyAPI).not.toHaveBeenCalled();
    }
  );

  test.each(MODES)(
    '%s 최종 확인 중 현재 제재가 갱신되면 부여를 막는다',
    async (mode) => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <PenaltyHistoryAddDialog
          member={MEMBER}
          mode={mode}
          onOpenChange={onOpenChange}
        />
      );
      await user.click(
        screen.getByRole('button', {
          name: mode === 'WARNING' ? '경고 추가' : '강등 추가',
        })
      );
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();

      rerender(
        <PenaltyHistoryAddDialog
          member={{ ...MEMBER, isBlacklist: true, blacklistType: 'RELEGATION' }}
          mode={mode}
          onOpenChange={onOpenChange}
        />
      );

      expect(
        screen.queryByRole('button', { name: '확인' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        PENALTY_ADD_BLOCKED_MESSAGE
      );
      expect(warnPenaltyAPI).not.toHaveBeenCalled();
    }
  );
});
