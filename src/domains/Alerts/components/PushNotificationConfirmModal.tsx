import { useMemo } from 'react';

import { DetailList } from '@/shared/components/DetailList';
import { ConfirmModal } from '@/shared/components/ui';
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
    <ConfirmModal
      isOpen={isOpen}
      title='푸시 알림 전송 확인'
      description='아래 내용으로 푸시 알림을 전송하시겠습니까?'
      onConfirm={onConfirm}
      onClose={onClose}
      isPending={isLoading}
      confirmText='즉시 발송'
      pendingText='발송 중...'
    >
      <DetailList items={CONFIRMATION_DATA} />
    </ConfirmModal>
  );
}
