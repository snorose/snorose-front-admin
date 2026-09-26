import { ConfirmModal, Textarea } from '@/shared/components/ui';

interface ExamReviewDeleteModalProps {
  isOpen: boolean;
  existingMemo: string | null;
  deleteReason: string;
  isDeleting: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExamReviewDeleteModal({
  isOpen,
  existingMemo,
  deleteReason,
  isDeleting,
  onReasonChange,
  onClose,
  onConfirm,
}: ExamReviewDeleteModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      confirmText={isDeleting ? '삭제 중' : '삭제'}
      confirmButtonClassName='bg-red-600 text-white hover:bg-red-700'
      confirmDisabled={!deleteReason.trim() || isDeleting}
      closeText='취소'
      onClose={onClose}
      onConfirm={onConfirm}
      title='시험 후기 삭제'
      description='시험후기를 삭제하시겠습니까?'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label
            htmlFor='exam-review-existing-memo'
            className='text-sm font-medium text-gray-700'
          >
            기존 메모
          </label>
          <Textarea
            id='exam-review-existing-memo'
            value={existingMemo ?? ''}
            placeholder='기존 메모가 없습니다.'
            className='min-h-[96px] resize-none bg-gray-50'
            readOnly
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label
            htmlFor='exam-review-delete-reason'
            className='text-sm font-medium text-gray-700'
          >
            삭제 사유
          </label>
          <Textarea
            id='exam-review-delete-reason'
            value={deleteReason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder='삭제 사유를 입력해주세요.'
            className='min-h-[120px] resize-none'
            disabled={isDeleting}
          />
          <p className='text-sm text-gray-500'>
            기존 메모 아래에 [삭제 사유]로 저장됩니다.
          </p>
        </div>
      </div>
    </ConfirmModal>
  );
}
