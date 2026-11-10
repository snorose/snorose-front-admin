import { useId } from 'react';

import { ConfirmModal, Textarea } from '@/shared/components/ui';

interface ExamReviewReasonModalProps {
  existingMemo: string | null;
  reason: string;
  action: 'delete' | 'restore';
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export function ExamReviewReasonModal({
  existingMemo,
  reason,
  action,
  isOpen,
  onClose,
  isPending,
  onReasonChange,
  onConfirm,
}: ExamReviewReasonModalProps) {
  const id = useId();
  const memoId = `${id}-memo`;
  const reasonId = `${id}-reason`;

  const isDelete = action === 'delete';
  const actionLabel = isDelete ? '삭제' : '복구';
  const reasonLabel = `${actionLabel} 사유`;

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={`시험 후기 ${actionLabel}`}
      description={
        isDelete
          ? '시험후기를 삭제하시겠습니까?'
          : '삭제된 시험후기를 복구하시겠습니까?'
      }
      confirmText={isPending ? `${actionLabel} 중` : actionLabel}
      confirmVariant={isDelete ? 'destructive' : 'default'}
      confirmDisabled={!reason.trim() || isPending}
      closeText='취소'
      footerClassName='mt-3 grid grid-cols-2 gap-4 sm:grid sm:grid-cols-2 sm:justify-normal [&>button]:w-full'
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2 border-b pb-4 text-sm'>
          <p className='text-xs leading-normal break-keep text-red-600'>
            {isDelete
              ? '삭제 시 포인트 100포인트가 차감되고 인앱 알림이 발송됩니다.'
              : '시험후기를 복구하면 사용자에게 100포인트가 다시 지급됩니다.'}
            <br />
            신중하게 확인한 후 {actionLabel}해주세요.
          </p>
        </div>
        <div className='flex flex-col gap-1'>
          <label htmlFor={memoId} className='text-sm font-medium text-gray-700'>
            기존 메모
          </label>
          <Textarea
            id={memoId}
            value={existingMemo ?? ''}
            placeholder='기존 메모가 없습니다.'
            className='bg-muted min-h-[96px] resize-none'
            readOnly
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label
            htmlFor={reasonId}
            className='text-sm font-medium text-gray-700'
          >
            {reasonLabel}
          </label>
          <Textarea
            id={reasonId}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.nativeEvent.isComposing &&
                (event.metaKey || event.ctrlKey) &&
                reason.trim() &&
                !isPending
              ) {
                event.preventDefault();
                onConfirm();
              }
            }}
            placeholder={`${reasonLabel}를 입력해주세요.`}
            className='min-h-[120px] resize-none'
            disabled={isPending}
          />
          <p className='text-xs text-gray-500'>
            기존 메모 아래에 [{reasonLabel}]로 저장됩니다.
          </p>
        </div>
      </div>
    </ConfirmModal>
  );
}
