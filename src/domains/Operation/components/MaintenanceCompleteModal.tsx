import { useRef, useState } from 'react';

import { toast } from 'sonner';

import { DescriptionListModal } from '@/shared/components';
import { formatDateTimeToMinutes, getErrorMessage } from '@/shared/utils';

import { completeAdminMaintenance } from '@/apis/maintenance';

import type { ServerMaintenanceListItem } from '../types/maintenance';

export function MaintenanceCompleteModal({
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
      title='서버 점검 즉시 종료'
      description='확인하면 점검이 즉시 종료되고 점검 안내가 해제됩니다.'
      className='max-w-xs sm:max-w-sm [&_[data-slot=dialog-description]]:break-keep'
      items={[
        { label: '사용자 안내 제목', value: item.title },
        { label: '시작 일시', value: formatDateTimeToMinutes(item.startAt) },
        { label: '기존 종료 예정', value: formatDateTimeToMinutes(item.endAt) },
        { label: '변경 후 종료', value: '즉시 종료 처리 시각' },
      ]}
      isPending={isPending}
      action={{
        label: '즉시 종료',
        variant: 'destructive',
        disabled: item.status !== 'IN_PROGRESS',
        pendingLabel: '종료 중…',
        onClick: async () => {
          if (busy.current || item.status !== 'IN_PROGRESS') return;
          busy.current = true;
          setIsPending(true);
          try {
            await completeAdminMaintenance(item.id);
            onChanged();
            toast.success('서버 점검이 종료되었습니다.');
            onClose();
          } catch (error) {
            toast.error(
              getErrorMessage(error, '서버 점검 즉시 종료에 실패했습니다.')
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
