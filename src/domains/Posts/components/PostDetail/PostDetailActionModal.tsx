import { useId } from 'react';

import { ConfirmModal, Textarea } from '@/shared/components/ui';

interface PostDetailActionModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  modalType: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE';
  reason: string;
  onReasonChange: (val: string) => void;
  deleteCommentsAlso: boolean;
  onDeleteCommentsAlsoChange: (val: boolean) => void;
  onConfirm: () => void;
}

export default function PostDetailActionModal({
  isOpen,
  isPending = false,
  onClose,
  modalType,
  reason,
  onReasonChange,
  deleteCommentsAlso,
  onDeleteCommentsAlsoChange,
  onConfirm,
}: PostDetailActionModalProps) {
  const reasonId = useId();

  if (!isOpen) return null;

  const actionText =
    modalType === 'HIDE'
      ? '비공개'
      : modalType === 'SHOW'
        ? '공개'
        : modalType === 'RESTORE'
          ? '복구'
          : '삭제';

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <ConfirmModal
        isOpen={isOpen}
        title={`게시글 ${actionText} 처리`}
        description='상태를 변경하는 사유를 작성해 주세요. (필수 입력)'
        confirmVariant={modalType === 'DELETE' ? 'destructive' : 'default'}
        confirmDisabled={!reason.trim()}
        isPending={isPending}
        onClose={onClose}
        onConfirm={onConfirm}
      >
        <div className='flex flex-col gap-4'>
          <label htmlFor={reasonId} className='sr-only'>
            변경 사유
          </label>
          <Textarea
            id={reasonId}
            className='min-h-[100px]'
            placeholder='변경 사유를 입력하세요…'
            value={reason}
            disabled={isPending}
            onChange={(event) => onReasonChange(event.target.value)}
          />

          {modalType === 'DELETE' && (
            <label className='mt-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700 select-none'>
              <input
                type='checkbox'
                checked={deleteCommentsAlso}
                disabled={isPending}
                onChange={(event) =>
                  onDeleteCommentsAlsoChange(event.target.checked)
                }
                className='cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              게시글에 달린 댓글도 함께 전부 삭제 처리
            </label>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}
