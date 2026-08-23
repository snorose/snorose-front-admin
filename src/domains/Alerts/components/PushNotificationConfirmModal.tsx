import { useMemo } from 'react';

import { Button, Dialog } from '@/shared/components/ui';
import type { PushNotification } from '@/shared/types';

interface PushNotificationConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: PushNotification;
}

export function PushNotificationConfirmModal({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  data,
}: PushNotificationConfirmModalProps) {
  const CONFIRMATION_DATA = useMemo(
    () => [
      { label: '알림명', value: data.name },
      { label: '알림 제목', value: data.title },
      { label: '알림 내용', value: data.body },
      { label: 'URL', value: data.url },
      {
        label: 'URL 타입',
        value: data.isExternal ? '외부 URL' : '스노로즈 내부 URL',
      },
      {
        label: '메시지 유형',
        value: data.isMarketing ? '광고성' : '정보성',
      },
      {
        label: '발송 대상',
        value: data.isTest
          ? '관리자에게만 테스트 발송'
          : '푸시 알림 허용 회원 전체에게 발송',
      },
    ],
    [data]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          onClose();
        }
      }}
    >
      <Dialog.Content showCloseButton={!isLoading}>
        <Dialog.Header>
          <Dialog.Title>푸시 알림 전송 확인</Dialog.Title>
          <Dialog.Description>
            아래 내용으로 푸시 알림을 전송하시겠습니까?
          </Dialog.Description>
        </Dialog.Header>
        <div className='flex flex-col gap-3 py-4'>
          {CONFIRMATION_DATA.map((data) => (
            <div className='flex items-start gap-2' key={data.label}>
              <span className='flex-shrink-0 text-sm font-semibold'>
                {data.label}:
              </span>
              <span className='text-sm break-keep'>{data.value}</span>
            </div>
          ))}
        </div>

        <Dialog.Footer className='grid grid-cols-2 gap-3 sm:grid sm:grid-cols-2 sm:justify-normal'>
          <Button
            type='button'
            variant='outline'
            size='lg'
            disabled={isLoading}
            onClick={onClose}
            className='w-full'
          >
            취소
          </Button>
          <Button
            type='button'
            size='lg'
            disabled={isLoading}
            onClick={onConfirm}
            className='w-full'
          >
            {isLoading ? '발송 중...' : '즉시 발송'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
