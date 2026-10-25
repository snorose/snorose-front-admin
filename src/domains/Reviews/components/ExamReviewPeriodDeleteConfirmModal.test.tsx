import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { expect, test, vi } from 'vitest';

import { deleteExamReviewPeriodAPI } from '@/apis';

import { ExamReviewPeriodDeleteConfirmModal } from './ExamReviewPeriodDeleteConfirmModal';

vi.mock('@/apis', () => ({ deleteExamReviewPeriodAPI: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

test('삭제 중 닫기와 재실행을 막고 실패 후 재시도하면 닫고 목록을 갱신한다', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  let fail!: (error: Error) => void;
  vi.mocked(deleteExamReviewPeriodAPI).mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        fail = reject;
      })
  );
  render(
    <ExamReviewPeriodDeleteConfirmModal
      isDeleteModalOpen
      selectedItem={{
        id: 12,
        title: '시험 기간',
        type: 'WRITE',
        startAt: '2026-10-01T00:00:00',
        endAt: '2026-10-30T00:00:00',
        createdAt: '',
        updatedAt: '',
      }}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
  await user.click(screen.getByRole('button', { name: '삭제' }));
  expect(screen.getByRole('button', { name: '삭제 중' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '삭제 중' }));
  await user.keyboard('{Escape}');
  expect(deleteExamReviewPeriodAPI).toHaveBeenCalledExactlyOnceWith(12);
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => fail(new Error('삭제 실패')));
  expect(toast.error).toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
  vi.mocked(deleteExamReviewPeriodAPI).mockResolvedValueOnce(undefined);
  await user.click(screen.getByRole('button', { name: '삭제' }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(onClose).toHaveBeenCalledOnce();
  expect(deleteExamReviewPeriodAPI).toHaveBeenCalledTimes(2);
});
