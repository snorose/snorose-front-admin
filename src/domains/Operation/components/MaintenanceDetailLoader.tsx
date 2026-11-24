import type { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Button, Dialog, Skeleton } from '@/shared/components/ui';
import { getErrorMessage } from '@/shared/utils';

import { getAdminMaintenance } from '@/apis/maintenance';

import type { ServerMaintenanceDetail } from '../types/maintenance';

export function MaintenanceDetailLoader({
  id,
  title,
  onClose,
  children,
}: {
  id: number;
  title: string;
  onClose: () => void;
  children: (detail: ServerMaintenanceDetail) => ReactNode;
}) {
  const query = useQuery({
    queryKey: ['server-maintenance', id],
    queryFn: () => getAdminMaintenance(id),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: 'always',
  });
  if (query.isSuccess && !query.isFetching) return children(query.data);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className='sm:max-w-lg'>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>
            서버 점검 일정 정보를 불러옵니다.
          </Dialog.Description>
        </Dialog.Header>
        {query.isError && !query.isFetching ? (
          <div role='alert' className='flex flex-col gap-3'>
            <p className='text-destructive text-sm'>
              {getErrorMessage(
                query.error,
                '서버 점검 상세 조회에 실패했습니다.'
              )}
            </p>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                void query.refetch();
              }}
            >
              다시 시도
            </Button>
          </div>
        ) : (
          <div role='status' className='flex flex-col gap-3'>
            <span className='sr-only'>서버 점검 정보를 불러오는 중입니다.</span>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-24 w-full' />
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
}
