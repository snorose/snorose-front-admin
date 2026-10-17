import { useId, useState } from 'react';

import { ConfirmModal, Textarea } from '@/shared/components/ui';

interface StatusChangeModalProps {
  target: 'POST' | 'COMMENT';
  onClose: () => void;
  modalType: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE';
  onConfirmAction: (reason: string) => void;
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
        isOpen
        title={`${target === 'POST' ? '게시글' : '댓글'} ${actionText} 처리`}
        description='상태를 변경하는 사유를 작성해 주세요.'
        confirmVariant={modalType === 'DELETE' ? 'destructive' : 'default'}
        confirmDisabled={!reason.trim()}
        isPending={isPending}
        onClose={onClose}
        onConfirm={() => onConfirmAction(reason)}
      >
        <label htmlFor={reasonId} className='sr-only'>
          상태 변경 사유
        </label>
        <Textarea
          id={reasonId}
          className='min-h-[100px]'
          placeholder='사유를 입력하세요…'
          value={reason}
          disabled={isPending}
          onChange={(event) => setReason(event.target.value)}
        />
      </ConfirmModal>
    </div>
  );
}
