import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

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
  blacklistReasons: ['진행 중 강등 사유', '추가 경고 사유'],
  blacklistStartDate: '2026-08-20T00:00:00',
  blacklistEndDate: null,
};

const DEMOTION_HISTORY: BlacklistHistoryItem = {
  encryptedUserId: MEMBER.encryptedUserId,
  studentNumber: MEMBER.studentNumber,
  type: 'RELEGATION',
  blackReason: '진행 중 강등 사유',
  createdAt: '2026-10-18 01:20:21',
  relegationMonth: 12,
  adminName: '관리자',
};

function renderCard(penaltyHistory: BlacklistHistoryItem[], member = MEMBER) {
  render(
    <MemberPenaltySummaryCard
      hasNextPenaltyHistory={false}
      isPenaltyHistoryLoading={false}
      member={member}
      onLoadMorePenaltyHistory={vi.fn()}
      penaltyHistory={penaltyHistory}
      penaltyHistoryTotalCount={penaltyHistory.length}
    />
  );
}

describe('MemberPenaltySummaryCard', () => {
  afterEach(() => vi.useRealTimers());

  test('경고와 강등이 함께 있으면 모든 사유를 제재 사유로 표시한다', () => {
    renderCard([]);

    expect(screen.getByText('일반 강등')).toBeInTheDocument();
    expect(screen.getByText('경고 1회')).toBeInTheDocument();
    expect(screen.getByText('제재 사유')).toBeInTheDocument();
    expect(
      screen.getByText('진행 중 강등 사유 추가 경고 사유')
    ).toBeInTheDocument();
    expect(screen.queryByText('강등 사유')).not.toBeInTheDocument();
    expect(
      screen.getByText('강등 기간은 제재 이력에서 확인할 수 있습니다.')
    ).toBeInTheDocument();
  });

  test('이력의 개월 수로 종료일과 남은 기간을 만들어 표시하지 않는다', () => {
    renderCard([DEMOTION_HISTORY]);

    expect(screen.queryByText('강등 종료일')).not.toBeInTheDocument();
    expect(screen.queryByText('남은 기간')).not.toBeInTheDocument();
    expect(screen.queryByText('강등 시작일')).not.toBeInTheDocument();
  });

  test('서버 종료 시각이 생성 시각과 달라도 서버 값으로 종료 상태를 표시한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-10-18T00:30:00'));
    renderCard([DEMOTION_HISTORY], {
      ...MEMBER,
      blacklistEndDate: '2027-10-18T00:00:00',
    });

    expect(screen.getByText('강등 종료일')).toBeInTheDocument();
    expect(screen.getByText('2027-10-18 00:00')).toBeInTheDocument();
    expect(screen.getByText('종료됨')).toBeInTheDocument();
    expect(screen.queryByText('2027-10-18 01:20')).not.toBeInTheDocument();
  });

  test('이력을 조회하지 않아도 회원 상세의 강등 일자를 그대로 표시한다', () => {
    renderCard([], {
      ...MEMBER,
      blacklistType: 'RELEGATION',
      blacklistStartDate: '2026-10-18T00:00:00',
      blacklistEndDate: '2027-10-18T00:00:00',
    });

    expect(screen.getByText('강등 시작일')).toBeInTheDocument();
    expect(screen.getByText('2026-10-18 00:00')).toBeInTheDocument();
    expect(screen.getByText('강등 종료일')).toBeInTheDocument();
    expect(screen.getByText('2027-10-18 00:00')).toBeInTheDocument();
  });
});
