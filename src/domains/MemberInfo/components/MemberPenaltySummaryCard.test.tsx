import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import MemberPenaltySummaryCard from './MemberPenaltySummaryCard';

const MEMBER: MemberInfo = {
  encryptedUserId: 'encrypted-user-id',
  loginId: 'test-id',
  userName: '테스트',
  email: 'test@sookmyung.ac.kr',
  nickname: '테스터',
  userRoleId: 6,
  studentNumber: '1234567',
  major: '컴퓨터과학전공',
  birthday: '2000-01-01',
  pointBalance: 100,
  createdAt: '2026-01-01T00:00:00',
  authenticatedAt: null,
  currentWarningCount: 1,
  totalWarningCount: 1,
  isBlacklist: true,
  blacklistType: 'WARNING',
  blacklistReason: '최신 경고 사유',
  blacklistStartDate: '2026-08-20T00:00:00',
  blacklistEndDate: null,
};

const ONGOING_DEMOTION: BlacklistHistoryItem = {
  encryptedUserId: MEMBER.encryptedUserId,
  studentNumber: MEMBER.studentNumber,
  type: 'RELEGATION',
  blackReason: '진행 중 강등 사유',
  createdAt: '2026-01-01 00:00:00',
  blacklistStartDate: '2026-01-01 00:00:00',
  blacklistDeadline: '2099-01-01 00:00:00',
  adminName: '관리자',
};

function renderCard(penaltyHistory: BlacklistHistoryItem[]) {
  render(
    <MemberPenaltySummaryCard
      hasNextPenaltyHistory={false}
      isPenaltyHistoryLoading={false}
      member={MEMBER}
      onLoadMorePenaltyHistory={vi.fn()}
      penaltyHistory={penaltyHistory}
      penaltyHistoryTotalCount={penaltyHistory.length}
    />
  );
}

describe('MemberPenaltySummaryCard', () => {
  test('강등 중 최신 경고 정보를 강등 사유로 표시하지 않는다', () => {
    renderCard([]);

    expect(screen.getByText('일반 강등')).toBeInTheDocument();
    expect(screen.getByText('경고 1회')).toBeInTheDocument();
    expect(screen.queryByText('최신 경고 사유')).not.toBeInTheDocument();
    expect(
      screen.getByText('강등 상세 정보는 제재 이력에서 확인할 수 있습니다.')
    ).toBeInTheDocument();
  });

  test('조회된 진행 중 강등 이력으로 강등 상세 정보를 표시한다', () => {
    renderCard([ONGOING_DEMOTION]);

    expect(screen.getByText('강등 사유')).toBeInTheDocument();
    expect(screen.getByText('진행 중 강등 사유')).toBeInTheDocument();
    expect(screen.queryByText('최신 경고 사유')).not.toBeInTheDocument();
  });
});
