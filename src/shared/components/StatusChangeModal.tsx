import { useId, useRef, useState } from 'react';

import { Button, Textarea } from '@/shared/components/ui';

const DELETE_REASON_PRESETS = [
  '포인트/출첵 관련 게시글 및 댓글',
  '무성의/초성 관련 게시글 및 댓글',
  '불법촬영물 게시 및 유통',
  '상업적 광고 및 판매글',
] as const;

interface StatusChangeModalProps {
  target: 'POST' | 'COMMENT';
  onClose: () => void;
  modalType: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE';
  onConfirmAction: (reason: string, includeComments: boolean) => void;
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
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);
  const [reason, setReason] = useState('');
  const [deleteCommentsAlso, setDeleteCommentsAlso] = useState(false);
  const [restoreCommentsAlso, setRestoreCommentsAlso] = useState(false);
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
                ? '삭제 복구'
                : '삭제'}{' '}
          처리
        </h3>
        <p className='mb-4 text-xs text-gray-500'>
          상태를 변경하는 사유를 작성해 주세요.
        </p>

        <div className='flex flex-col gap-4'>
          {modalType === 'DELETE' && (
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-medium text-gray-700'>
                자주 쓰는 삭제 사유
              </span>
              <div className='flex flex-wrap gap-2'>
                {DELETE_REASON_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type='button'
                    variant='outline'
                    size='xs'
                    className='h-auto py-1.5 text-left whitespace-normal'
                    disabled={isPending}
                    onClick={() => {
                      setReason(preset);
                      reasonInputRef.current?.focus();
                    }}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <label htmlFor={reasonId} className='sr-only'>
            상태 변경 사유
          </label>
          <Textarea
            ref={reasonInputRef}
            id={reasonId}
            className='min-h-[100px]'
            placeholder='사유를 입력하세요...'
            disabled={isPending}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {target === 'POST' && modalType === 'DELETE' && (
            <label className='flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700'>
              <input
                type='checkbox'
                checked={deleteCommentsAlso}
                disabled={isPending}
                onChange={(e) => setDeleteCommentsAlso(e.target.checked)}
              />
              게시글에 달린 댓글도 함께 전부 삭제 처리
            </label>
          )}
          {target === 'POST' && modalType === 'RESTORE' && (
            <label className='flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700'>
              <input
                type='checkbox'
                checked={restoreCommentsAlso}
                disabled={isPending}
                onChange={(e) => setRestoreCommentsAlso(e.target.checked)}
              />
              게시글에 달린 삭제된 하위 댓글도 전부 복구 처리
            </label>
          )}
          <div className='mt-2 flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type='button'
              variant={modalType === 'DELETE' ? 'destructive' : 'default'}
              size='sm'
              onClick={() =>
                onConfirmAction(
                  reason,
                  modalType === 'RESTORE'
                    ? restoreCommentsAlso
                    : deleteCommentsAlso
                )
              }
              disabled={isPending || !reason.trim()}
            >
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
