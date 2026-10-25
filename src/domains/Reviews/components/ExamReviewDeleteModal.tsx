import { ConfirmModal } from '@/shared/components/ui';

import { ExamReviewReasonFields } from './ExamReviewReasonFields';

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
      confirmText='삭제'
      isPending={isDeleting}
      pendingText='삭제 중'
      confirmVariant='destructive'
      confirmDisabled={!deleteReason.trim() || isDeleting}
      closeText='취소'
      onClose={onClose}
      onConfirm={onConfirm}
      title='시험 후기 삭제'
      description='시험후기를 삭제하시겠습니까?'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2 border-b pb-4 text-sm'>
          <p className='leading-relaxed break-keep text-red-600'>
            삭제 시 사용자 포인트 100점이 차감되고 인앱 알림이 발송됩니다.
            <br />
            신중하게 확인한 후 삭제해주세요.
          </p>
        </div>
        <ExamReviewReasonFields
          action='삭제'
          existingMemo={existingMemo}
          reason={deleteReason}
          disabled={isDeleting}
          onReasonChange={onReasonChange}
          onConfirm={onConfirm}
        />
      </div>
    </ConfirmModal>
  );
}
