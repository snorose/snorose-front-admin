import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExamReviewPeriod } from '@/shared/types';

import { EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY } from '@/domains/Reviews/hooks';
import type { ExamReviewAdminStatusResult } from '@/domains/Reviews/types';

import {
  getExamReviewAdminStatus,
  getExamReviewPeriodsAPI,
  patchExamReviewPeriodAPI,
  postExamReviewPeriodAPI,
} from '@/apis';

import { ExamReviewAdminStatusDialog } from './ExamReviewAdminStatusDialog';
import { ExamReviewAdminStatusPeriodDialog } from './ExamReviewAdminStatusPeriodDialog';

vi.mock('@/apis', () => ({
  getExamReviewAdminStatus: vi.fn(),
  getExamReviewPeriodsAPI: vi.fn(),
  postExamReviewPeriodAPI: vi.fn(),
  patchExamReviewPeriodAPI: vi.fn(),
  deleteExamReviewPeriodAPI: vi.fn(),
}));

const PERIODS: ExamReviewPeriod[] = [
  {
    type: 'ADMIN_EDIT',
    id: 1,
    title: '2026-1학기 중간고사',
    startAt: '2026-04-01T00:00:00',
    endAt: '2026-05-15T23:59:00',
    createdAt: '2026-03-20T09:00:00',
    updatedAt: '2026-03-20T09:00:00',
  },
  {
    type: 'ADMIN_EDIT',
    id: 2,
    title: '2026-1학기 기말고사',
    startAt: '2026-06-01T00:00:00',
    endAt: '2026-07-15T23:59:00',
    createdAt: '2026-05-20T09:00:00',
    updatedAt: '2026-05-20T09:00:00',
  },
  {
    type: 'ADMIN_EDIT',
    id: 3,
    title: '2026 여름학기',
    startAt: '2026-07-16T00:00:00',
    endAt: '2026-08-31T23:59:00',
    createdAt: '2026-07-10T09:00:00',
    updatedAt: '2026-07-10T09:00:00',
  },
  {
    type: 'ADMIN_EDIT',
    id: 4,
    title: '2026-2학기 중간고사',
    startAt: '2026-10-01T00:00:00',
    endAt: '2026-11-15T23:59:00',
    createdAt: '2026-08-10T09:00:00',
    updatedAt: '2026-08-10T09:00:00',
  },
];

const createStatus = (periodId: number): ExamReviewAdminStatusResult => ({
  periodId,
  periodTitle: '어드민',
  startAt: '2026-09-03T00:00:00',
  endAt: '2026-10-12T00:00:00',
  totalCount: 7,
  confirmedCount: 5,
  remainingCount: 2,
  confirmedRate: 71.4,
  averagePerAdmin: 4,
  adminStatics: [
    {
      encryptedAdminId: 'admin-rose',
      nickname: '로즈매니저',
      processedCount: 1,
    },
    {
      encryptedAdminId: 'admin-snow',
      nickname: '눈송관리자',
      processedCount: 4,
    },
  ],
});

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

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <DialogHarness />
      </QueryClientProvider>
    ),
    queryClient,
  };
};

describe('ExamReviewAdminStatusDialog', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-08-22T12:00:00'));
    vi.resetAllMocks();
    vi.mocked(getExamReviewPeriodsAPI).mockImplementation(async () =>
      PERIODS.map((period) => ({ ...period }))
    );
    vi.mocked(getExamReviewAdminStatus).mockImplementation(async (periodId) =>
      createStatus(periodId)
    );
  });

  test('첫 번째 기간을 기본 선택하고 기간 탭으로 현황을 전환한다', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(
      screen.getByRole('dialog', { name: '담당 관리자 현황' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Mock 데이터')).not.toBeInTheDocument();

    const activePeriodTab = await screen.findByRole('tab', {
      name: '2026-2학기 중간고사',
    });
    expect(getExamReviewPeriodsAPI).toHaveBeenCalledWith('ADMIN_EDIT');

    await waitFor(() =>
      expect(activePeriodTab).toHaveAttribute('aria-selected', 'true')
    );

    await user.click(screen.getByRole('tab', { name: '2026 여름학기' }));
    const progress = await screen.findByRole('progressbar', {
      name: '시험후기 확인 완료율',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '71.4');
    expect(screen.getByText('눈송관리자')).toBeInTheDocument();
    expect(screen.getByText('로즈매니저')).toBeInTheDocument();
    expect(screen.queryByText('1인당 평균')).not.toBeInTheDocument();
    expect(getExamReviewAdminStatus).toHaveBeenLastCalledWith(3);
    expect(screen.queryByText('담당자 미상')).not.toBeInTheDocument();
    const names = screen
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(names).toEqual(['눈송관리자4건', '로즈매니저1건']);
  });

  test('편집에서 돌아오면 선택을 유지하고 새로 열면 첫 기간을 선택한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    const firstPeriod = await screen.findByRole('tab', {
      name: '2026-2학기 중간고사',
    });
    await waitFor(() =>
      expect(firstPeriod).toHaveAttribute('aria-selected', 'true')
    );
    await user.click(screen.getByRole('tab', { name: '2026 여름학기' }));
    await user.click(screen.getByRole('button', { name: '기간 편집' }));
    await user.click(screen.getByRole('button', { name: '현황 보기' }));
    expect(screen.getByRole('tab', { name: '2026 여름학기' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await user.click(screen.getByRole('button', { name: '창 닫기' }));
    await user.click(screen.getByRole('button', { name: '현황 열기' }));
    await waitFor(() =>
      expect(
        screen.getByRole('tab', { name: '2026-2학기 중간고사' })
      ).toHaveAttribute('aria-selected', 'true')
    );
  });

  test('재조회가 끝나기 전에 캐시된 첫 기간을 선택하고 최신 목록에 맞춘다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() =>
      expect(
        screen.getByRole('tab', { name: '2026-2학기 중간고사' })
      ).toHaveAttribute('aria-selected', 'true')
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
        screen.getByRole('tab', { name: '2026-2학기 중간고사' })
      ).toHaveAttribute('aria-selected', 'true')
    );

    const periods = PERIODS;
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
        screen.getByRole('tab', { name: '새로운 첫 기간' })
      ).toHaveAttribute('aria-selected', 'true')
    );
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
    await screen.findByRole('tab', { name: '2026 여름학기' });
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
  test.each(['추가', '수정'] as const)(
    '기간 %s 후 목록 갱신 실패 시 저장 완료를 안내하고 목록만 재조회한다',
    async (operation) => {
      const user = userEvent.setup();
      const { queryClient } = renderDialog();
      await screen.findByRole('tab', { name: '2026 여름학기' });
      await user.click(screen.getByRole('button', { name: '기간 편집' }));
      await user.click(
        screen.getByRole('button', {
          name: operation === '추가' ? '기간 추가' : '2026 여름학기 수정',
        })
      );
      const form = screen.getByRole('dialog', { name: `기간 ${operation}` });
      const title = within(form).getByLabelText(/기간 이름/);
      await user.clear(title);
      await user.type(title, '저장된 기간');
      if (operation === '추가') {
        await user.click(
          within(form).getByRole('button', { name: '시작 일시' })
        );
        await user.click(
          screen.getByRole('button', { name: /2026년 8월 1일/ })
        );
        await user.click(
          within(form).getByRole('button', { name: '종료 일시' })
        );
        await user.click(
          screen.getByRole('button', { name: /2026년 8월 31일/ })
        );
      }
      const savedPeriod = {
        ...PERIODS[2],
        id: operation === '추가' ? 5 : 3,
        title: '저장된 기간',
      };
      vi.mocked(getExamReviewPeriodsAPI)
        .mockRejectedValueOnce(new Error('목록 조회 실패'))
        .mockResolvedValueOnce([
          ...PERIODS.filter((period) => period.id !== savedPeriod.id),
          savedPeriod,
        ]);
      await user.click(within(form).getByRole('button', { name: '저장' }));

      expect(
        await screen.findByText(
          '기간 저장은 완료되었습니다. 목록만 다시 불러와주세요.'
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('dialog', { name: `기간 ${operation}` })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '저장' })
      ).not.toBeInTheDocument();
      const getCount = vi.mocked(getExamReviewPeriodsAPI).mock.calls.length;
      await user.click(screen.getByRole('button', { name: '다시 시도' }));

      expect(await screen.findByText('저장된 기간')).toBeInTheDocument();
      expect(getExamReviewPeriodsAPI).toHaveBeenCalledTimes(getCount + 1);
      expect(postExamReviewPeriodAPI).toHaveBeenCalledTimes(
        operation === '추가' ? 1 : 0
      );
      expect(patchExamReviewPeriodAPI).toHaveBeenCalledTimes(
        operation === '수정' ? 1 : 0
      );

      vi.mocked(getExamReviewPeriodsAPI).mockRejectedValueOnce(
        new Error('별개의 목록 조회 실패')
      );
      await act(async () => {
        await queryClient.refetchQueries({
          queryKey: ['examReviewAdminStatusPeriods', 'ADMIN_EDIT'],
        });
      });
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '기간을 불러오지 못했습니다.'
      );
      expect(
        screen.queryByText(
          '기간 저장은 완료되었습니다. 목록만 다시 불러와주세요.'
        )
      ).not.toBeInTheDocument();
    }
  );

  test.each([false, true])(
    '저장 후 목록 조회 실패 여부(%s)와 관계없이 편집 재진입 시 이전 저장 안내를 표시하지 않는다',
    async (refreshFailed) => {
      const user = userEvent.setup();
      const { queryClient } = renderDialog();
      await screen.findByRole('tab', { name: '2026 여름학기' });
      await user.click(screen.getByRole('button', { name: '기간 편집' }));
      await user.click(
        screen.getByRole('button', { name: '2026 여름학기 수정' })
      );
      const form = screen.getByRole('dialog', { name: '기간 수정' });
      await user.type(within(form).getByLabelText(/기간 이름/), ' 변경');
      if (refreshFailed) {
        vi.mocked(getExamReviewPeriodsAPI).mockRejectedValueOnce(
          new Error('저장 후 조회 실패')
        );
      }
      await user.click(within(form).getByRole('button', { name: '저장' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: '기간 수정' })
        ).not.toBeInTheDocument()
      );
      if (refreshFailed) {
        expect(
          await screen.findByText(
            '기간 저장은 완료되었습니다. 목록만 다시 불러와주세요.'
          )
        ).toBeInTheDocument();
      }

      await user.click(screen.getByRole('button', { name: '현황 보기' }));
      await screen.findByRole('tab', { name: '2026 여름학기' });
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));
      vi.mocked(getExamReviewPeriodsAPI).mockRejectedValueOnce(
        new Error('재진입 조회 실패')
      );
      await user.click(screen.getByRole('button', { name: '기간 편집' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        '기간을 불러오지 못했습니다.'
      );
      expect(
        screen.queryByText(
          '기간 저장은 완료되었습니다. 목록만 다시 불러와주세요.'
        )
      ).not.toBeInTheDocument();
      expect(patchExamReviewPeriodAPI).toHaveBeenCalledTimes(1);
    }
  );

  test('기간 전환 중에는 이전 통계 대신 로딩을 표시한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByText('71.4%');
    let resolveStatus!: (value: ExamReviewAdminStatusResult) => void;
    vi.mocked(getExamReviewAdminStatus).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStatus = resolve;
      })
    );
    await user.click(screen.getByRole('tab', { name: '2026 여름학기' }));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    await act(async () =>
      resolveStatus({ ...createStatus(3), confirmedRate: 20 })
    );
    expect(await screen.findByText('20%')).toBeInTheDocument();
  });

  test('현황을 다시 열면 같은 기간의 최신 수치를 조회한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByText('71.4%');
    await user.click(screen.getByRole('button', { name: '창 닫기' }));
    vi.mocked(getExamReviewAdminStatus).mockResolvedValue({
      ...createStatus(4),
      confirmedRate: 100,
    });
    await user.click(screen.getByRole('button', { name: '현황 열기' }));
    expect(await screen.findByText('100%')).toBeInTheDocument();
  });

  test('통계 조회가 실패하면 재시도할 수 있다', async () => {
    vi.mocked(getExamReviewAdminStatus).mockRejectedValueOnce(
      new Error('조회 실패')
    );
    const user = userEvent.setup();
    renderDialog();
    expect(
      await screen.findByText('현황을 불러오지 못했습니다.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('71.4%')).toBeInTheDocument();
  });

  test('후기와 처리 관리자가 없으면 0%와 빈 목록을 표시한다', async () => {
    vi.mocked(getExamReviewAdminStatus).mockResolvedValue({
      ...createStatus(4),
      totalCount: 0,
      confirmedCount: 0,
      remainingCount: 0,
      confirmedRate: 0,
      averagePerAdmin: 0,
      adminStatics: [],
    });
    renderDialog();
    expect(await screen.findByText('0%')).toBeInTheDocument();
    for (const label of ['기간 내 업로드', '확인 완료', '미확인']) {
      expect(screen.getByText(label).parentElement).toHaveTextContent(/0\s*건/);
    }
    expect(screen.getByText('처리 내역이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByText('1인당 평균')).not.toBeInTheDocument();
  });

  test('통계와 관리자 처리 합계가 달라도 미상 건수를 추정하지 않는다', async () => {
    vi.mocked(getExamReviewAdminStatus).mockResolvedValue({
      ...createStatus(4),
      adminStatics: [
        {
          encryptedAdminId: 'deleted-admin',
          nickname: null,
          processedCount: 9,
        },
      ],
      averagePerAdmin: 7,
    });
    renderDialog();
    expect(await screen.findByText('닉네임 없음')).toBeInTheDocument();
    expect(screen.getByText('9건')).toBeInTheDocument();
    expect(screen.queryByText('1인당 평균')).not.toBeInTheDocument();
    expect(screen.queryByText('담당자 미상')).not.toBeInTheDocument();
  });

  test('등록된 기간이 없으면 통계를 요청하지 않고 기간 추가를 안내한다', async () => {
    vi.mocked(getExamReviewPeriodsAPI).mockResolvedValue([]);
    renderDialog();
    expect(
      await screen.findByText('등록된 현황 집계 기간이 없습니다.')
    ).toBeInTheDocument();
    expect(getExamReviewAdminStatus).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: '기간 추가' })
    ).toBeInTheDocument();
  });
  test('집계 설명은 제목 옆 버튼의 툴팁에서 확인하고 Escape로 닫는다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByText('71.4%');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.hover(
      screen.getByRole('button', { name: '시험후기 확인 현황 설명' })
    );
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      '선택한 기간에 업로드된 시험후기의 확인 상태'
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );

    const managerInfo = screen.getByRole('button', {
      name: '관리자별 처리 현황 설명',
    });
    act(() => managerInfo.focus());
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      '미확인 → 확인으로 변경한 횟수'
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole('dialog', { name: '담당 관리자 현황' })
    ).toBeInTheDocument();

    await user.click(managerInfo);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      '미확인 → 확인으로 변경한 횟수'
    );
  });
  test('방향키와 Home·End 키로 기간 탭을 전환한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    const first = await screen.findByRole('tab', {
      name: '2026-2학기 중간고사',
    });
    await waitFor(() => expect(first).toHaveAttribute('aria-selected', 'true'));
    act(() => first.focus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        screen.getByRole('tab', { name: '2026 여름학기' })
      ).toHaveAttribute('aria-selected', 'true')
    );
    expect(getExamReviewAdminStatus).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      screen.getByRole('tab', { name: '2026 여름학기' }).id
    );
    await user.keyboard('{End}');
    await waitFor(() =>
      expect(
        screen.getByRole('tab', { name: '2026-1학기 중간고사' })
      ).toHaveAttribute('aria-selected', 'true')
    );
    await user.keyboard('{Home}');
    await waitFor(() => expect(first).toHaveAttribute('aria-selected', 'true'));
  });
  test('만료된 기간 캐시는 즉시 표시하고 백그라운드에서 갱신한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByText('71.4%');

    vi.mocked(getExamReviewAdminStatus).mockResolvedValueOnce({
      ...createStatus(3),
      confirmedRate: 50,
    });
    await user.click(screen.getByRole('tab', { name: '2026 여름학기' }));
    await screen.findByText('50%');

    vi.setSystemTime(new Date('2026-08-22T12:00:31'));

    let resolveStatus!: (value: ExamReviewAdminStatusResult) => void;
    vi.mocked(getExamReviewAdminStatus).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStatus = resolve;
      })
    );
    await user.click(screen.getByRole('tab', { name: '2026-2학기 중간고사' }));
    expect(screen.getByText('71.4%')).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: '현황을 불러오는 중' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-busy', 'true');
    expect(getExamReviewAdminStatus).toHaveBeenLastCalledWith(4);

    await act(async () =>
      resolveStatus({ ...createStatus(4), confirmedRate: 85.7 })
    );
    expect(await screen.findByText('85.7%')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-busy', 'false');
  });
  test('30초 안에 다시 선택한 기간은 추가 요청 없이 통계 캐시를 표시한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByText('71.4%');
    vi.mocked(getExamReviewAdminStatus).mockResolvedValueOnce({
      ...createStatus(3),
      confirmedRate: 50,
    });
    await user.click(screen.getByRole('tab', { name: '2026 여름학기' }));
    await screen.findByText('50%');
    expect(getExamReviewAdminStatus).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('tab', { name: '2026-2학기 중간고사' }));
    expect(screen.getByText('71.4%')).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-busy', 'false');
    expect(getExamReviewAdminStatus).toHaveBeenCalledTimes(2);
  });

  test('통계 캐시를 무효화하면 30초 안에도 최신 통계로 갱신한다', async () => {
    const { queryClient } = renderDialog();
    await screen.findByText('71.4%');
    vi.mocked(getExamReviewAdminStatus).mockResolvedValue({
      ...createStatus(4),
      confirmedRate: 85.7,
    });
    await act(async () => {
      await queryClient.invalidateQueries({
        queryKey: EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY,
      });
    });
    expect(await screen.findByText('85.7%')).toBeInTheDocument();
    expect(getExamReviewAdminStatus).toHaveBeenCalledTimes(2);
  });
});
