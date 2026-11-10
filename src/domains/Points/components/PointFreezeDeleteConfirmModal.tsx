import { toast } from 'sonner';

import { DescriptionListModal } from '@/shared/components';
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
    <DescriptionListModal
      open={isDeleteModalOpen}
      onClose={onClose}
      title='일정 삭제'
      description='포인트 미지급 일정을 삭제하시겠습니까?'
      className='max-w-xs sm:max-w-sm'
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
      isPending={isPending}
      action={{
        label: '삭제',
        variant: 'destructive',
        onClick: handleDeleteConfirm,
        pendingLabel: '삭제 중...',
      }}
    />
  );
}
