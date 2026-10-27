import { MemoryRouter } from 'react-router-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { MemberInfo, MemberPointHistory } from '@/shared/types';

import MemberDetailInfoGrid from './MemberDetailInfoGrid';
import MemberPointSection from './MemberPointSection';
import PenaltyUserInfoView from './PenaltyUserInfoView';
import PointHistoryCard from './point-history/PointHistoryCard';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const member: MemberInfo = {
  encryptedUserId: 'encrypted-member-id',
  loginId: 'snowrose',
  studentNumber: '2512345',
  userName: '테스트',
  nickname: '테스터',
  email: 'test@sookmyung.ac.kr',
  major: '컴퓨터과학전공',
  birthday: '2000-01-01',
  userRoleId: 2,
  pointBalance: 100,
  createdAt: '2026-01-01T00:00:00',
  authenticatedAt: null,
  totalWarningCount: 0,
  isBlacklist: false,
  blacklistStartDate: null,
  blacklistEndDate: null,
};

const history: MemberPointHistory = {
  id: 123,
  difference: 10,
  category: 'POST_WRITE',
  source: 'POST',
  sourceId: 456,
  sourceDetail: null,
  createdAt: '2026-01-01T00:00:00',
};

beforeEach(() => {
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('회원 정보의 공통 복사 UI', () => {
  test('회원 상세의 복사 항목은 읽기 전용 입력으로 표시하고 원문을 복사한다', async () => {
    const onHistory = vi.fn();
    render(
      <>
        <MemberDetailInfoGrid member={member} roleLabel='정회원' />
        <MemberPointSection
          pointBalance={member.pointBalance}
          onPointAdjustmentOpen={vi.fn()}
          onPointHistoryOpen={onHistory}
        />
      </>
    );
    for (const [label, value] of [
      ['아이디', member.loginId],
      ['학번', member.studentNumber],
      ['회원 ID (암호화)', member.encryptedUserId],
    ]) {
      const input = screen.getByRole('textbox', { name: label });
      expect(input).toHaveValue(value);
      expect(input).toHaveAttribute('readonly');
      fireEvent.click(screen.getByRole('button', { name: `${label} 복사` }));
      await waitFor(() =>
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(value)
      );
    }
    expect(screen.getByLabelText('이름')).toHaveValue(member.userName);
    fireEvent.click(screen.getByRole('button', { name: '포인트 이력 열기' }));
    expect(onHistory).toHaveBeenCalledTimes(1);
  });

  test('제재 관리에서 회원 미선택 안내와 복사 비활성화를 유지한다', async () => {
    const { rerender } = render(<PenaltyUserInfoView member={null} />);
    expect(screen.getByText('회원을 검색해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '학번 복사' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '아이디 복사' })).toBeDisabled();
    rerender(<PenaltyUserInfoView member={member} />);
    expect(screen.queryByText('회원을 검색해 주세요.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '학번' })).toHaveValue(
      member.studentNumber
    );
    fireEvent.click(screen.getByRole('button', { name: '학번 복사' }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        member.studentNumber
      )
    );
  });

  test('포인트 카드의 로그 ID만 복사하고 관련 게시글 링크는 유지한다', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <PointHistoryCard history={history} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('123'));
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '로그 ID 복사' }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('123')
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/posts/manage/456'
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    rerender(
      <MemoryRouter>
        <PointHistoryCard
          history={{ ...history, category: 'ADMIN', source: 'ADMIN' }}
        />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '관리자 ID 복사' }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('456')
    );
  });
});
