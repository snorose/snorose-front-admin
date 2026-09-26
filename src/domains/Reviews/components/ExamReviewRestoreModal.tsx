import { ConfirmModal, Textarea } from '@/shared/components/ui';

interface ExamReviewRestoreModalProps {
  isOpen: boolean;
  existingMemo: string | null;
  restoreReason: string;
  isRestoring: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExamReviewRestoreModal({
  isOpen,
  existingMemo,
  restoreReason,
  isRestoring,
  onReasonChange,
  onClose,
  onConfirm,
}: ExamReviewRestoreModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title='시험 후기 복구'
      description='삭제된 시험후기를 복구하시겠습니까?'
      confirmText={isRestoring ? '복구 중' : '복구'}
      confirmDisabled={!restoreReason.trim() || isRestoring}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2 border-b pb-4 text-sm'>
          <p className='leading-relaxed text-red-600'>
            시험후기를 복구하면 사용자에게 100포인트가 다시 지급됩니다.
            <br />
            신중하게 확인한 후 복구해주세요.
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <label
            htmlFor='exam-review-restore-existing-memo'
            className='text-sm font-medium text-gray-700'
          >
            기존 메모
          </label>
          <Textarea
            id='exam-review-restore-existing-memo'
            value={existingMemo ?? ''}
            placeholder='기존 메모가 없습니다.'
            className='min-h-[96px] resize-none bg-gray-50'
            readOnly
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label
            htmlFor='exam-review-restore-reason'
            className='text-sm font-medium text-gray-700'
          >
            복구 사유
          </label>
          <Textarea
            id='exam-review-restore-reason'
            value={restoreReason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder='복구 사유를 입력해주세요.'
            className='min-h-[120px] resize-none'
            disabled={isRestoring}
          />
          <p className='text-sm text-gray-500'>
            기존 메모 아래에 [복구 사유]로 저장됩니다.
          </p>
        </div>
      </div>
    </ConfirmModal>
  );
}
