import { toast } from 'sonner';

import { ConfirmModal } from '@/shared/components/ui';
import type { PointFreeze } from '@/shared/types';
import { formatDateTimeToMinutes, getErrorMessage } from '@/shared/utils';

import { useDeletePointFreeze } from '@/domains/Points/hooks';

interface PointFreezeDeleteConfirmModalProps {
  isDeleteModalOpen: boolean;
  selectedItem: PointFreeze;
  onClose: () => void;
}
export function PointFreezeDeleteConfirmModal({
  isDeleteModalOpen,
  selectedItem,
  onClose,
}: PointFreezeDeleteConfirmModalProps) {
  const { mutateAsync, isPending } = useDeletePointFreeze();
  const handleDeleteConfirm = async () => {
    if (!selectedItem || isPending) return;

    try {
      await mutateAsync(selectedItem.id);
      toast.success('미지급 일정 삭제가 완료되었어요.');
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '미지급 일정 삭제에 실패했습니다.'));
    }
  };

  return (
    <ConfirmModal
      isOpen={isDeleteModalOpen}
      title='일정 삭제'
      description='포인트 미지급 일정을 삭제하시겠습니까?'
      onConfirm={handleDeleteConfirm}
      onClose={onClose}
      isPending={isPending}
      size='sm'
      confirmText='삭제'
      pendingText='삭제 중'
      confirmVariant='destructive'
    >
      <div className='flex min-w-0 flex-col gap-3 wrap-anywhere'>
        <ul className='ml-4 flex list-outside list-disc flex-col gap-1'>
          <li>
            <span className='shrink-0 text-sm font-semibold text-gray-700'>
              일정 제목:{' '}
            </span>
            <span className='text-sm'>{selectedItem.title}</span>
          </li>
          <li>
            <span className='shrink-0 text-sm font-semibold text-gray-700'>
              시작 일시:{' '}
            </span>
            <span className='text-sm'>
              {formatDateTimeToMinutes(selectedItem.startAt)}
            </span>
          </li>
          <li>
            <span className='shrink-0 text-sm font-semibold text-gray-700'>
              종료 일시:{' '}
            </span>
            <span className='text-sm'>
              {formatDateTimeToMinutes(selectedItem.endAt)}
            </span>
          </li>
        </ul>
      </div>
    </ConfirmModal>
  );
}
