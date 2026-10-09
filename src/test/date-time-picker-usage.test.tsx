import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExamReviewPeriod, PointFreeze } from '@/shared/types';

import { PopupEditorDialog } from '@/domains/Operation/components/PopupEditorDialog';
import type { PopupContent } from '@/domains/Operation/types';
import { PointFreezeScheduleForm } from '@/domains/Points/components/PointFreezeScheduleForm';
import { PointFreezeUpdateConfirmModal } from '@/domains/Points/components/PointFreezeUpdateConfirmModal';
import { ExamReviewPeriodScheduleForm } from '@/domains/Reviews/components/ExamReviewPeriodScheduleForm';
import { ExamReviewPeriodUpdateConfirmModal } from '@/domains/Reviews/components/ExamReviewPeriodUpdateConfirmModal';

const mocks = vi.hoisted(() => ({
  createFreeze: vi.fn(),
  updateFreeze: vi.fn(),
  createPeriod: vi.fn(),
  updatePeriod: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/domains/Points/hooks', () => ({
  useCreatePointFreeze: () => ({
    mutateAsync: mocks.createFreeze,
    isPending: false,
  }),
  useUpdatePointFreeze: () => ({
    mutateAsync: mocks.updateFreeze,
    isPending: false,
  }),
}));
vi.mock('@/apis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/apis')>()),
  postExamReviewPeriodAPI: mocks.createPeriod,
  patchExamReviewPeriodAPI: mocks.updatePeriod,
}));
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: vi.fn() } }));

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
  HTMLElement.prototype.scrollIntoView = () => undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
  for (const mutate of [
    mocks.createFreeze,
    mocks.updateFreeze,
    mocks.createPeriod,
    mocks.updatePeriod,
  ]) {
    mutate.mockResolvedValue(undefined);
  }
});

async function chooseDate(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  day: number
) {
  await user.click(screen.getByRole('button', { name: label }));
  await user.selectOptions(
    screen.getByRole('combobox', { name: '연도 선택' }),
    '2026'
  );
  await user.selectOptions(
    screen.getByRole('combobox', { name: '월 선택' }),
    '9'
  );
  await user.click(
    screen.getByRole('button', { name: new RegExp(`2026년 10월 ${day}일`) })
  );
}

async function chooseTime(
  user: ReturnType<typeof userEvent.setup>,
  label: string
) {
  await user.click(screen.getByRole('combobox', { name: `${label} 시` }));
  await user.click(screen.getByRole('option', { name: '23시' }));
  await user.click(screen.getByRole('combobox', { name: `${label} 분` }));
  await user.click(screen.getByRole('option', { name: '59분' }));
}

const initialItem: PointFreeze & ExamReviewPeriod = {
  id: 1,
  title: '기존 일정',
  startAt: '2026-10-09 08:30:00',
  endAt: '2026-10-17 23:59:00',
  createdAt: '2026-09-27 00:00:00',
  updatedAt: '2026-09-27 00:00:00',
};

describe('DateTimePicker 일정 사용처', () => {
  test.each(['미지급 일정', '작성 기간'])(
    '%s 생성에서 필수 검증·요청 형식·초기화를 유지한다',
    async (kind) => {
      const user = userEvent.setup();
      const isFreeze = kind === '미지급 일정';
      const onSuccess = vi.fn();
      render(
        isFreeze ? (
          <PointFreezeScheduleForm />
        ) : (
          <ExamReviewPeriodScheduleForm onSuccess={onSuccess} />
        )
      );
      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(mocks.error).toHaveBeenLastCalledWith(
        '모든 필수 항목을 입력해주세요.'
      );
      const mutate = isFreeze ? mocks.createFreeze : mocks.createPeriod;
      expect(mutate).not.toHaveBeenCalled();
      await user.type(
        screen.getByLabelText(isFreeze ? /일정 제목/ : /기간 제목/),
        '달력 일정'
      );
      await chooseDate(user, '시작 일시', 9);
      await chooseDate(user, '종료 일시', 17);
      await chooseTime(user, '종료 일시');
      await user.click(screen.getByRole('button', { name: '종료 일시' }));
      await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(mutate).not.toHaveBeenCalled();
      expect(
        screen.getByRole('combobox', { name: '종료 일시 시' })
      ).toHaveTextContent('23시');
      await chooseDate(user, '종료 일시', 17);
      await user.click(screen.getByRole('button', { name: '생성' }));
      const separator = isFreeze ? ' ' : 'T';
      const request = {
        title: '달력 일정',
        startAt: `2026-10-09${separator}00:00:00`,
        endAt: `2026-10-17${separator}23:59:00`,
      };
      expect(mutate).toHaveBeenCalledExactlyOnceWith(
        isFreeze ? request : [request]
      );
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: '시작 일시' })
        ).toHaveTextContent('시작 날짜 선택')
      );
      expect(
        screen.getByRole('button', { name: '종료 일시' })
      ).toHaveTextContent('종료 날짜 선택');
      expect(
        screen.getByRole('combobox', { name: '종료 일시 시' })
      ).toHaveTextContent('00시');
      if (!isFreeze) expect(onSuccess).toHaveBeenCalledOnce();
    }
  );

  test.each(['미지급 일정', '작성 기간'])(
    '%s 수정 모달에서 재열기 초기값과 저장 요청을 유지한다',
    async (kind) => {
      const user = userEvent.setup();
      const isFreeze = kind === '미지급 일정';
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const modal = (
        open: boolean,
        selectedItem: PointFreeze & ExamReviewPeriod
      ) =>
        isFreeze ? (
          <PointFreezeUpdateConfirmModal
            isUpdateModalOpen={open}
            selectedItem={selectedItem}
            onClose={onClose}
          />
        ) : (
          <ExamReviewPeriodUpdateConfirmModal
            isUpdateModalOpen={open}
            selectedItem={selectedItem}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        );
      const { rerender } = render(modal(true, initialItem));
      expect(
        screen.getByRole('button', { name: '시작 일시' })
      ).toHaveTextContent('2026-10-09');
      expect(
        screen.getByRole('combobox', { name: '시작 일시 시' })
      ).toHaveTextContent('08시');
      rerender(modal(false, initialItem));
      const nextItem = {
        ...initialItem,
        id: 2,
        title: '다음 일정',
        startAt: '2026-10-10T09:15:00',
      };
      rerender(modal(true, nextItem));
      expect(
        screen.getByRole('button', { name: '시작 일시' })
      ).toHaveTextContent('2026-10-10');
      expect(
        screen.getByRole('combobox', { name: '시작 일시 분' })
      ).toHaveTextContent('15분');
      await chooseDate(user, '시작 일시', 15);
      await chooseTime(user, '시작 일시');
      await user.click(screen.getByRole('button', { name: '수정' }));
      const separator = isFreeze ? ' ' : 'T';
      const request = {
        title: '다음 일정',
        startAt: `2026-10-15${separator}23:59:00`,
        endAt: `2026-10-17${separator}23:59:00`,
      };
      if (isFreeze)
        expect(mocks.updateFreeze).toHaveBeenCalledExactlyOnceWith({
          id: 2,
          data: request,
        });
      else
        expect(mocks.updatePeriod).toHaveBeenCalledExactlyOnceWith(2, request);
      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
      if (!isFreeze) expect(onSuccess).toHaveBeenCalledOnce();
    }
  );

  test('팝업 날짜·시간 변경과 해제 콜백, 외부 초기값 갱신을 유지한다', async () => {
    const user = userEvent.setup();
    const popup: PopupContent = {
      id: 1,
      title: '팝업',
      bodyMarkdown: '',
      imageFileName: '',
      displayPriority: 1,
      startDate: '2026-10-09T08:30',
      endDate: '2026-10-17T23:59',
      createdAt: '',
      updatedAt: '',
    };
    const props = {
      open: true,
      mode: 'edit' as const,
      imagePreviewUrl: '',
      onOpenChange: vi.fn(),
      onPopupChange: vi.fn(),
      onImageAttach: vi.fn(),
      onImageRemove: vi.fn(),
      onSave: vi.fn(),
    };
    const { rerender } = render(<PopupEditorDialog {...props} popup={popup} />);
    expect(props.onPopupChange).not.toHaveBeenCalled();
    await chooseDate(user, '게시 시작일시', 15);
    expect(props.onPopupChange).toHaveBeenLastCalledWith(
      'startDate',
      '2026-10-15T08:30'
    );
    await chooseTime(user, '게시 시작일시');
    expect(props.onPopupChange).toHaveBeenLastCalledWith(
      'startDate',
      '2026-10-15T23:59'
    );
    await user.click(screen.getByRole('button', { name: '게시 시작일시' }));
    await user.click(screen.getByRole('button', { name: '날짜 선택 해제' }));
    expect(props.onPopupChange).toHaveBeenLastCalledWith('startDate', '');
    expect(
      screen.getByRole('combobox', { name: '게시 시작일시 시' })
    ).toHaveTextContent('23시');
    rerender(
      <PopupEditorDialog
        {...props}
        popup={{ ...popup, startDate: '2024-02-29T12:34' }}
      />
    );
    expect(
      screen.getByRole('button', { name: '게시 시작일시' })
    ).toHaveTextContent('2024-02-29');
    expect(
      screen.getByRole('combobox', { name: '게시 시작일시 분' })
    ).toHaveTextContent('34분');
    expect(props.onSave).not.toHaveBeenCalled();
  });
});
