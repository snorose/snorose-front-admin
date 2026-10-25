import { useId, useState } from 'react';

import { ConfirmModal, Textarea } from '@/shared/components/ui';

interface StatusChangeModalProps {
  target: 'POST' | 'COMMENT';
  onClose: () => void;
  modalType: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE';
  onConfirmAction: (reason: string, deleteCommentsAlso: boolean) => void;
  isPending?: boolean;
}
export default function StatusChangeModal({
  target,
  modalType,
  onClose,
  onConfirmAction,
  isPending = false,
}: StatusChangeModalProps) {
  const reasonId = useId();
  const [reason, setReason] = useState('');
  const [deleteCommentsAlso, setDeleteCommentsAlso] = useState(false);
  return (
    <div className='contents' onClick={(event) => event.stopPropagation()}>
      <ConfirmModal
        isOpen
        title={`${target === 'POST' ? '게시글' : '댓글'} ${
          modalType === 'HIDE'
            ? '비공개'
            : modalType === 'SHOW'
              ? '공개'
              : modalType === 'RESTORE'
                ? '복구'
                : '삭제'
        } 처리`}
        description='상태를 변경하는 사유를 작성해 주세요.'
        className='sm:max-w-md'
        onClose={onClose}
        onConfirm={() => onConfirmAction(reason, deleteCommentsAlso)}
        confirmVariant={modalType === 'DELETE' ? 'destructive' : 'default'}
        confirmDisabled={!reason.trim()}
        isPending={isPending}
        pendingText='처리 중'
      >
        <div className='flex flex-col gap-4'>
          <label htmlFor={reasonId} className='sr-only'>
            상태 변경 사유
          </label>
          <Textarea
            id={reasonId}
            className='min-h-[100px]'
            placeholder='사유를 입력하세요...'
            value={reason}
            disabled={isPending}
            onChange={(event) => setReason(event.target.value)}
          />
          {target === 'POST' && modalType === 'DELETE' && (
            <label className='flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700'>
              <input
                type='checkbox'
                checked={deleteCommentsAlso}
                disabled={isPending}
                onChange={(event) =>
                  setDeleteCommentsAlso(event.target.checked)
                }
              />
              게시글에 달린 댓글도 함께 전부 삭제 처리
            </label>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}
