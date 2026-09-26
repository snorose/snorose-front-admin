import { toast } from 'sonner';

import { Button, Dialog } from '@/shared/components/ui';
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

  const handleDeleteCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={handleDeleteCancel}>
      <Dialog.Content className='max-w-xs sm:max-w-sm'>
        <Dialog.Header>
          <Dialog.Title>일정 삭제</Dialog.Title>
          <Dialog.Description>
            포인트 미지급 일정을 삭제하시겠습니까?
          </Dialog.Description>
        </Dialog.Header>
        <div className='flex flex-col gap-3'>
          <ul className='ml-4 flex list-outside list-disc flex-col gap-1'>
            <li>
              <span className='text-sm font-semibold'>일정 제목: </span>
              <span className='text-sm'>{selectedItem.title}</span>
            </li>
            <li>
              <span className='text-sm font-semibold'>시작 일시: </span>
              <span className='text-sm'>
                {formatDateTimeToMinutes(selectedItem.startAt)}
              </span>
            </li>
            <li>
              <span className='text-sm font-semibold'>종료 일시: </span>
              <span className='text-sm'>
                {formatDateTimeToMinutes(selectedItem.endAt)}
              </span>
            </li>
          </ul>
        </div>
        <Dialog.Footer>
          <Button type='button' variant='outline' onClick={handleDeleteCancel}>
            취소
          </Button>
          <Button
            type='button'
            disabled={isPending}
            onClick={handleDeleteConfirm}
          >
            삭제
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
