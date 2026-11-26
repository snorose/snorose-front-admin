import { useRef, useState } from 'react';

import { toast } from 'sonner';

import { DescriptionListModal } from '@/shared/components';
import { formatDateTimeToMinutes, getErrorMessage } from '@/shared/utils';

import { deleteAdminMaintenance } from '@/apis/maintenance';

import type { ServerMaintenanceListItem } from '../types/maintenance';

export function MaintenanceDeleteModal({
  item,
  onClose,
  onChanged,
}: {
  item: ServerMaintenanceListItem;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const busy = useRef(false);
  return (
    <DescriptionListModal
      open
      onClose={onClose}
      title='서버 점검 일정 삭제'
      description='서버 점검 일정을 삭제하시겠습니까?'
      className='max-w-xs sm:max-w-sm'
      items={[
        { label: '사용자 안내 제목', value: item.title },
        { label: '시작 일시', value: formatDateTimeToMinutes(item.startAt) },
        { label: '종료 일시', value: formatDateTimeToMinutes(item.endAt) },
      ]}
      isPending={isPending}
      action={{
        label: '삭제',
        variant: 'destructive',
        disabled: item.status === 'IN_PROGRESS',
        pendingLabel: '삭제 중…',
        onClick: async () => {
          if (busy.current || item.status === 'IN_PROGRESS') return;
          busy.current = true;
          setIsPending(true);
          try {
            await deleteAdminMaintenance(item.id);
            onChanged();
            toast.success('서버 점검 일정이 삭제되었습니다.');
            onClose();
          } catch (error) {
            toast.error(
              getErrorMessage(error, '서버 점검 일정 삭제에 실패했습니다.')
            );
          } finally {
            busy.current = false;
            setIsPending(false);
          }
        },
      }}
    />
  );
}
