import { ConfirmModal } from '@/shared/components/ui';

import { ExamReviewReasonFields } from './ExamReviewReasonFields';

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
      confirmText='복구'
      isPending={isRestoring}
      pendingText='복구 중'
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
        <ExamReviewReasonFields
          action='복구'
          existingMemo={existingMemo}
          reason={restoreReason}
          disabled={isRestoring}
          onReasonChange={onReasonChange}
          onConfirm={onConfirm}
        />
      </div>
    </ConfirmModal>
  );
}
