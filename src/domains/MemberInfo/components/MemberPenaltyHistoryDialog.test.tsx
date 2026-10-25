import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

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

const EXISTING_PENALTY_MEMBERS: [string, MemberInfo][] = [
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
  ['강등자 등급', { ...MEMBER, userRoleId: 6 }],
];

const MODES: AddPenaltyMode[] = ['WARNING', 'DEMOTION'];
const PERMANENTLY_DEMOTED_MEMBER: MemberInfo = {
  ...MEMBER,
  isBlacklist: true,
  blacklistType: 'BLACKLIST',
  userRoleId: 6,
};
const ADDABLE_MEMBERS: [string, MemberInfo][] = [
  ['제재 없음', MEMBER],
  ...EXISTING_PENALTY_MEMBERS,
];
const ADD_CASES = ADDABLE_MEMBERS.flatMap(([label, member]) =>
  MODES.map((mode) => ({ label, member, mode }))
);
ADD_CASES.push({
  label: '영구 강등',
  member: PERMANENTLY_DEMOTED_MEMBER,
  mode: 'DEMOTION',
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(warnPenaltyAPI).mockResolvedValue(undefined);
});

function renderHistory(
  member: MemberInfo,
  histories: BlacklistHistoryItem[] = []
) {
  return render(
    <MemberPenaltyHistoryDialog
      hasNext={false}
      histories={histories}
      isLoading={false}
      member={member}
      onLoadMore={vi.fn()}
      onOpenChange={vi.fn()}
      open
      totalCount={histories.length}
    />
  );
}

describe('회원 페이지 제재 추가', () => {
  test('새 응답 필드로 경고 횟수와 강등 개월 수를 표시한다', () => {
    const baseHistory = {
      encryptedUserId: MEMBER.encryptedUserId,
      studentNumber: MEMBER.studentNumber,
      blackReason: '제재 사유',
      adminName: '관리자',
    };
    renderHistory(MEMBER, [
      {
        ...baseHistory,
        type: 'WARNING',
        createdAt: '2026-01-02 00:00:00',
        warningCount: 2,
      },
      {
        ...baseHistory,
        type: 'RELEGATION',
        createdAt: '2026-01-01 00:00:00',
        relegationMonth: 12,
      },
    ]);

    expect(screen.getByText('경고 횟수')).toBeInTheDocument();
    expect(screen.getByText('2회')).toBeInTheDocument();
    expect(screen.getByText('강등 기간')).toBeInTheDocument();
    expect(screen.getByText('12개월')).toBeInTheDocument();
    expect(screen.queryByText('강등 종료일')).not.toBeInTheDocument();
    expect(screen.queryByText('진행중')).not.toBeInTheDocument();
    expect(screen.queryByText('종료', { exact: true })).not.toBeInTheDocument();
  });

  test.each(EXISTING_PENALTY_MEMBERS)(
    '%s 회원에게 경고와 강등을 추가할 수 있다',
    (_label, member) => {
      renderHistory(member);

      for (const name of ['경고 추가', '강등 추가']) {
        expect(screen.getByRole('button', { name })).toBeEnabled();
      }
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

  test.each(ADD_CASES)(
    '$label 회원의 $mode 추가 요청을 전송한다',
    async ({ member, mode }) => {
      const user = userEvent.setup();
      const onApplied = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <PenaltyHistoryAddDialog
          member={member}
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

  test('영구강등 회원은 경고 추가 제한을 유지하고 강등은 추가할 수 있다', () => {
    renderHistory(PERMANENTLY_DEMOTED_MEMBER);

    expect(screen.getByRole('button', { name: '경고 추가' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '강등 추가' })).toBeEnabled();
    expect(
      screen.getByText('영구강등 회원에게는 경고를 추가할 수 없습니다.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(PENALTY_ADD_BLOCKED_MESSAGE)
    ).not.toBeInTheDocument();
  });

  test.each(MODES)(
    '%s 최종 확인 중 일반강등 상태로 갱신되어도 추가할 수 있다',
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

      await user.click(screen.getByRole('button', { name: '확인' }));
      await waitFor(() => expect(warnPenaltyAPI).toHaveBeenCalledOnce());
    }
  );

  test('영구강등 회원의 경고 입력 팝업이 열려도 요청을 전송하지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <PenaltyHistoryAddDialog
        member={PERMANENTLY_DEMOTED_MEMBER}
        mode='WARNING'
        onOpenChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '경고 추가' }));

    expect(toast.error).toHaveBeenCalledWith(
      '영구강등 회원에게는 경고를 추가할 수 없습니다.'
    );
    expect(
      screen.queryByRole('button', { name: '확인' })
    ).not.toBeInTheDocument();
    expect(warnPenaltyAPI).not.toHaveBeenCalled();
  });
});
