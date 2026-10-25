import { useState } from 'react';

import { toast } from 'sonner';

import { ConfirmModal } from '@/shared/components/ui';
import type { ExamReviewPeriod } from '@/shared/types';
import { formatDateTimeToMinutes, getErrorMessage } from '@/shared/utils';

import { deleteExamReviewPeriodAPI } from '@/apis';

interface ExamReviewPeriodDeleteConfirmModalProps {
  isDeleteModalOpen: boolean;
  selectedItem: ExamReviewPeriod;
  onSuccess: () => void;
  onClose: () => void;
}
export function ExamReviewPeriodDeleteConfirmModal({
  isDeleteModalOpen,
  selectedItem,
  onSuccess,
  onClose,
}: ExamReviewPeriodDeleteConfirmModalProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!selectedItem || isPending) return;
    setIsPending(true);

    try {
      await deleteExamReviewPeriodAPI(selectedItem.id);
      toast.success('시험 후기 작성 기간 삭제가 완료되었어요.');
      onClose();
      await onSuccess();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '시험 후기 작성 기간 삭제에 실패했습니다.')
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isDeleteModalOpen}
      title='작성 기간 삭제'
      description='시험 후기 작성 기간을 삭제하시겠습니까?'
      onConfirm={handleDeleteConfirm}
      onClose={onClose}
      isPending={isPending}
      size='sm'
      confirmText='삭제'
      pendingText='삭제 중'
      confirmVariant='destructive'
    >
      <div className='flex min-w-0 flex-col gap-3 wrap-anywhere'>
        <ul className='ml-4 flex list-outside list-disc flex-col gap-1'>
          <li>
            <span className='shrink-0 text-sm font-semibold text-gray-700'>
              기간 제목:{' '}
            </span>
            <span className='text-sm'>{selectedItem.title}</span>
          </li>
          <li>
            <span className='shrink-0 text-sm font-semibold text-gray-700'>
              시작 일시:{' '}
            </span>
            <span className='text-sm'>
              {formatDateTimeToMinutes(selectedItem.startAt)}
            </span>
          </li>
          <li>
            <span className='shrink-0 text-sm font-semibold text-gray-700'>
              종료 일시:{' '}
            </span>
            <span className='text-sm'>
              {formatDateTimeToMinutes(selectedItem.endAt)}
            </span>
          </li>
        </ul>
      </div>
    </ConfirmModal>
  );
}
