import { toast } from 'sonner';

import { DetailList } from '@/shared/components/DetailList';
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
      <DetailList
        items={[
          { label: '일정 제목', value: selectedItem.title },
          {
            label: '시작 일시',
            value: formatDateTimeToMinutes(selectedItem.startAt),
          },
          {
            label: '종료 일시',
            value: formatDateTimeToMinutes(selectedItem.endAt),
          },
        ]}
      />
    </ConfirmModal>
  );
}
