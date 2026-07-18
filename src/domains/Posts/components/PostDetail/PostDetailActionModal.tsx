import { Button } from '@/shared/components/ui';

interface PostDetailActionModalProps {
  isOpen: boolean;
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
  onClose,
  modalType,
  reason,
  onReasonChange,
  deleteCommentsAlso,
  onDeleteCommentsAlsoChange,
  onConfirm,
}: PostDetailActionModalProps) {
  if (!isOpen) return null;

  const actionText =
    modalType === 'HIDE'
      ? '비공개'
      : modalType === 'SHOW'
        ? '공개'
        : modalType === 'RESTORE'
          ? '복구'
          : '삭제';
  const requiresReason = modalType !== 'RESTORE';

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg duration-150'>
        <h3 className='mb-2 text-base font-bold text-gray-900'>
          게시글 {actionText} 처리
        </h3>
        <p className='mb-4 text-xs text-gray-500'>
          {requiresReason
            ? '상태를 변경하는 사유를 작성해 주세요. (필수 입력)'
            : '삭제된 게시글을 공개 상태로 복구합니다.'}
        </p>

        <div className='flex flex-col gap-4'>
          {requiresReason && (
            <textarea
              className='min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
              placeholder='변경 사유를 입력하세요...'
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          )}

          {modalType === 'DELETE' && (
            <label className='mt-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-600 select-none'>
              <input
                type='checkbox'
                checked={deleteCommentsAlso}
                onChange={(e) => onDeleteCommentsAlsoChange(e.target.checked)}
                className='cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              게시글에 달린 댓글도 함께 전부 삭제 처리
            </label>
          )}

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
              onClick={onConfirm}
              disabled={requiresReason && !reason.trim()}
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
