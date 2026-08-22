import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { resetMockExamReviewAdminStatusPeriods } from '@/domains/Reviews/mocks';

import { ExamReviewAdminStatusDialog } from './ExamReviewAdminStatusDialog';
import { ExamReviewAdminStatusPeriodDialog } from './ExamReviewAdminStatusPeriodDialog';

function DialogHarness() {
  const [activeDialog, setActiveDialog] = useState<'status' | 'period-editor'>(
    'status'
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  return (
    <>
      <ExamReviewAdminStatusDialog
        open={activeDialog === 'status'}
        onOpenChange={() => undefined}
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
  });

  test('진행 중인 기간의 mock 관리자 현황을 기본으로 보여준다', async () => {
    renderDialog();

    expect(
      screen.getByRole('dialog', { name: '담당 관리자 현황' })
    ).toBeInTheDocument();
    expect(screen.getByText('Mock 데이터')).toBeInTheDocument();

    const activeTab = await screen.findByRole('tab', {
      name: '2026 여름학기',
    });

    await waitFor(() =>
      expect(activeTab).toHaveAttribute('data-state', 'active')
    );

    const progress = await screen.findByRole('progressbar', {
      name: '시험후기 확인 완료율',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '60');
    expect(screen.getByText('눈송관리자')).toBeInTheDocument();
    expect(screen.getByText('로즈매니저')).toBeInTheDocument();
    expect(screen.getByText('1인당 평균')).toBeInTheDocument();
  });

  test('기간 편집 다이얼로그에서 입력을 검증하고 현황으로 돌아온다', async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByRole('tab', { name: '2026 여름학기' });
    await user.click(screen.getByRole('button', { name: '기간 편집' }));
    expect(
      screen.getByRole('dialog', { name: '기간 편집' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: '담당 관리자 현황' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '기간 추가' }));
    await user.type(screen.getByLabelText(/기간 이름/), '새로운 기간');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      '기간 이름과 시작·종료 일시를 모두 입력해주세요.'
    );

    await user.click(screen.getByRole('button', { name: '현황 보기' }));
    const discardDialog = screen.getByRole('dialog', {
      name: '저장하지 않은 변경사항이 있습니다.',
    });
    await user.click(
      within(discardDialog).getByRole('button', {
        name: '변경사항 버리기',
      })
    );

    expect(
      screen.getByRole('dialog', { name: '담당 관리자 현황' })
    ).toBeInTheDocument();
  });
});
