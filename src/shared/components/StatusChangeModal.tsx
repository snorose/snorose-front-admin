import { useState } from 'react';

import { Button } from '@/shared/components/ui';

interface StatusChangeModalProps {
  target: 'POST' | 'COMMENT';
  onClose: () => void;
  modalType: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE';
  onConfirmAction: (reason: string) => void;
}
export default function StatusChangeModal({
  target,
  modalType,
  onClose,
  onConfirmAction,
}: StatusChangeModalProps) {
  const [reason, setReason] = useState('');
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg duration-150'>
        <h3 className='mb-2 text-base font-bold text-gray-900'>
          {target === 'POST' ? '게시글' : '댓글'}{' '}
          {modalType === 'HIDE'
            ? '비공개'
            : modalType === 'SHOW'
              ? '공개'
              : modalType === 'RESTORE'
                ? '복구'
                : '삭제'}{' '}
          처리
        </h3>
        <p className='mb-4 text-xs text-gray-500'>
          상태를 변경하는 사유를 작성해 주세요.
        </p>

        <div className='flex flex-col gap-4'>
          <textarea
            className='min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
            placeholder='사유를 입력하세요...'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className='mt-2 flex justify-end gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={onClose}
              className='border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50'
            >
              취소
            </Button>
            <Button
              variant={modalType === 'DELETE' ? 'destructive' : 'default'}
              size='sm'
              onClick={() => onConfirmAction(reason)}
              disabled={!reason.trim()}
              className={`text-xs ${modalType === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
