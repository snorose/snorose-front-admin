import { toast } from 'sonner';

import { Button, Dialog } from '@/shared/components/ui';
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

  const handleDeleteCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={handleDeleteCancel}>
      <Dialog.Content className='max-w-xs sm:max-w-sm'>
        <Dialog.Header>
          <Dialog.Title>작성 기간 삭제</Dialog.Title>
          <Dialog.Description>
            시험 후기 작성 기간을 삭제하시겠습니까?
          </Dialog.Description>
        </Dialog.Header>
        <div className='flex flex-col gap-3'>
          <ul className='ml-4 flex list-outside list-disc flex-col gap-1'>
            <li>
              <span className='text-sm font-semibold'>기간 제목: </span>
              <span className='text-sm'>{selectedItem.title}</span>
            </li>
            <li>
              <span className='text-sm font-semibold'>시작 일시: </span>
              <span className='text-sm'>
                {formatDateTimeToMinutes(selectedItem.startAt)}
              </span>
            </li>
            <li>
              <span className='text-sm font-semibold'>종료 일시: </span>
              <span className='text-sm'>
                {formatDateTimeToMinutes(selectedItem.endAt)}
              </span>
            </li>
          </ul>
        </div>
        <Dialog.Footer>
          <Button type='button' variant='outline' onClick={handleDeleteCancel}>
            취소
          </Button>
          <Button type='button' onClick={handleDeleteConfirm}>
            삭제
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
