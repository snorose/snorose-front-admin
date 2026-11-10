import { toast } from 'sonner';

import { DescriptionListModal } from '@/shared/components';
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
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      await deleteExamReviewPeriodAPI(selectedItem.id);
      toast.success('시험 후기 작성 기간 삭제가 완료되었어요.');
      onClose();
      await onSuccess();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '시험 후기 작성 기간 삭제에 실패했습니다.')
      );
    }
  };

  return (
    <DescriptionListModal
      open={isDeleteModalOpen}
      onClose={onClose}
      title='작성 기간 삭제'
      description='시험 후기 작성 기간을 삭제하시겠습니까?'
      className='max-w-xs sm:max-w-sm'
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
      action={{
        label: '삭제',
        variant: 'destructive',
        onClick: handleDeleteConfirm,
      }}
    />
  );
}
