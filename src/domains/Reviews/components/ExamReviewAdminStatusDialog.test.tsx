import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExamReviewPeriod } from '@/shared/types';

import {
  getMockExamReviewAdminStatusPeriods,
  resetMockExamReviewAdminStatusPeriods,
} from '@/domains/Reviews/mocks';

import { getExamReviewPeriodsAPI, patchExamReviewPeriodAPI } from '@/apis';

import { ExamReviewAdminStatusDialog } from './ExamReviewAdminStatusDialog';
import { ExamReviewAdminStatusPeriodDialog } from './ExamReviewAdminStatusPeriodDialog';

vi.mock('@/apis', () => ({
  getExamReviewPeriodsAPI: vi.fn(),
  postExamReviewPeriodAPI: vi.fn(),
  patchExamReviewPeriodAPI: vi.fn(),
  deleteExamReviewPeriodAPI: vi.fn(),
}));

function DialogHarness() {
  const [activeDialog, setActiveDialog] = useState<
    'closed' | 'status' | 'period-editor'
  >('status');
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  return (
    <>
      <button
        onClick={() => {
          setSelectedPeriodId(null);
          setActiveDialog('status');
        }}
      >
        현황 열기
      </button>
      <ExamReviewAdminStatusDialog
        open={activeDialog === 'status'}
        onOpenChange={(open) => setActiveDialog(open ? 'status' : 'closed')}
        selectedPeriodId={selectedPeriodId}
        onSelectedPeriodChange={setSelectedPeriodId}
        onOpenPeriodEditor={() => setActiveDialog('period-editor')}
      />
      <ExamReviewAdminStatusPeriodDialog
        open={activeDialog === 'period-editor'}
        onOpenChange={(open) =>
          setActiveDialog(open ? 'period-editor' : 'status')
        }
        onSelectedPeriodChange={setSelectedPeriodId}
      />
    </>
  );
}

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DialogHarness />
    </QueryClientProvider>
  );
};

describe('ExamReviewAdminStatusDialog', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-08-22T12:00:00'));
    resetMockExamReviewAdminStatusPeriods();
    vi.mocked(getExamReviewPeriodsAPI).mockImplementation(async () =>
      (await getMockExamReviewAdminStatusPeriods()).map((period) => ({
        ...period,
        type: 'ADMIN_EDIT',
      }))
    );
  });

  test('첫 번째 기간을 기본 선택하고 기간 버튼으로 현황을 전환한다', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(
      screen.getByRole('dialog', { name: '담당 관리자 현황' })
    ).toBeInTheDocument();
    expect(screen.getByText('Mock 데이터')).toBeInTheDocument();

    const activePeriodButton = await screen.findByRole('button', {
      name: '2026-2학기 중간고사',
    });
    expect(getExamReviewPeriodsAPI).toHaveBeenCalledWith('ADMIN_EDIT');

    await waitFor(() =>
      expect(activePeriodButton).toHaveAttribute('aria-pressed', 'true')
    );

    await user.click(screen.getByRole('button', { name: '2026 여름학기' }));
    const progress = await screen.findByRole('progressbar', {
      name: '시험후기 확인 완료율',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '60');
    expect(screen.getByText('눈송관리자')).toBeInTheDocument();
    expect(screen.getByText('로즈매니저')).toBeInTheDocument();
    expect(screen.getByText('1인당 평균')).toBeInTheDocument();
  });

  test('편집에서 돌아오면 선택을 유지하고 새로 열면 첫 기간을 선택한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    const firstPeriod = await screen.findByRole('button', {
      name: '2026-2학기 중간고사',
    });
    await waitFor(() =>
      expect(firstPeriod).toHaveAttribute('aria-pressed', 'true')
    );
    await user.click(screen.getByRole('button', { name: '2026 여름학기' }));
    await user.click(screen.getByRole('button', { name: '기간 편집' }));
    await user.click(screen.getByRole('button', { name: '현황 보기' }));
    expect(
      screen.getByRole('button', { name: '2026 여름학기' })
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '창 닫기' }));
    await user.click(screen.getByRole('button', { name: '현황 열기' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '2026-2학기 중간고사' })
      ).toHaveAttribute('aria-pressed', 'true')
    );
  });

  test('재조회가 끝나기 전에 캐시된 첫 기간을 선택하고 최신 목록에 맞춘다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '2026-2학기 중간고사' })
      ).toHaveAttribute('aria-pressed', 'true')
    );
    await user.click(screen.getByRole('button', { name: '창 닫기' }));

    let resolvePeriods!: (periods: ExamReviewPeriod[]) => void;
    vi.mocked(getExamReviewPeriodsAPI).mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePeriods = resolve;
      })
    );
    await user.click(screen.getByRole('button', { name: '현황 열기' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '2026-2학기 중간고사' })
      ).toHaveAttribute('aria-pressed', 'true')
    );

    const periods = (await getMockExamReviewAdminStatusPeriods()).map(
      (period) => ({ ...period, type: 'ADMIN_EDIT' as const })
    );
    await act(async () =>
      resolvePeriods([
        ...periods,
        {
          ...periods[0],
          id: 99,
          title: '새로운 첫 기간',
          startAt: '2027-01-01T00:00:00',
          endAt: '2027-01-31T23:59:00',
        },
      ])
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '새로운 첫 기간' })
      ).toHaveAttribute('aria-pressed', 'true')
    );
  });

  test('기간 편집 다이얼로그에서 입력을 검증하고 현황으로 돌아온다', async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByRole('button', { name: '2026 여름학기' });
    await user.click(screen.getByRole('button', { name: '기간 편집' }));
    expect(
      screen.getByRole('dialog', { name: '기간 편집' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: '담당 관리자 현황' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '기간 추가' }));
    expect(
      screen.getByRole('dialog', { name: '기간 추가' })
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/기간 이름/), '새로운 기간');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      '기간 이름과 시작·종료 일시를 모두 입력해주세요.'
    );

    await user.click(screen.getByRole('button', { name: '취소' }));
    const discardDialog = screen.getByRole('dialog', {
      name: '저장하지 않은 변경사항이 있습니다.',
    });
    await user.click(
      within(discardDialog).getByRole('button', {
        name: '변경사항 버리기',
      })
    );

    expect(
      screen.queryByRole('dialog', { name: '기간 추가' })
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '기간 추가' })).toHaveFocus()
    );
    await user.click(screen.getByRole('button', { name: '현황 보기' }));

    expect(
      screen.getByRole('dialog', { name: '담당 관리자 현황' })
    ).toBeInTheDocument();
  });

  test('수정 팝업에 기존 값을 채우고 저장하면 목록으로 돌아온다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByRole('button', { name: '2026 여름학기' });
    await user.click(screen.getByRole('button', { name: '기간 편집' }));
    await user.click(
      screen.getByRole('button', { name: '2026 여름학기 수정' })
    );
    const dialog = screen.getByRole('dialog', { name: '기간 수정' });
    const title = within(dialog).getByLabelText(/기간 이름/);
    expect(title).toHaveValue('2026 여름학기');
    await user.clear(title);
    await user.type(title, '변경한 기간');
    await user.click(within(dialog).getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: '기간 수정' })
      ).not.toBeInTheDocument()
    );
    expect(patchExamReviewPeriodAPI).toHaveBeenCalledWith(expect.any(Number), {
      type: 'ADMIN_EDIT',
      title: '변경한 기간',
      startAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
      endAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
    });
    expect(
      screen.getByRole('dialog', { name: '기간 편집' })
    ).toBeInTheDocument();
  });
});
