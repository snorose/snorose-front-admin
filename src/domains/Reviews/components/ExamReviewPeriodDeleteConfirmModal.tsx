import { useState } from 'react';

import { toast } from 'sonner';

import { DetailList } from '@/shared/components/DetailList';
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
      <DetailList
        items={[
          { label: '기간 제목', value: selectedItem.title },
          {
            label: '시작 일시',
            value: formatDateTimeToMinutes(selectedItem.startAt),
          },
          {
            label: '종료 일시',
            value: formatDateTimeToMinutes(selectedItem.endAt),
          },
        ]}
      />
    </ConfirmModal>
  );
}
