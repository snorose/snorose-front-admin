import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import type { PushNotification } from '@/types';
import { useMemo } from 'react';

interface PushNotificationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: PushNotification;
}

export default function PushNotificationConfirmModal({
  isOpen,
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
        label: '광고성 알림 여부',
        value: data.isMarketing ? '광고성' : '정보성',
      },
      {
        label: '테스트 발송 여부',
        value: data.isTest ? '관리자에게만' : '전체 발송',
      },
    ],
    [data]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>푸시 알림 전송 확인</DialogTitle>
          <DialogDescription>
            아래 내용으로 푸시 알림을 전송하시겠습니까?
          </DialogDescription>
        </DialogHeader>
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

        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            취소
          </Button>
          <Button type='button' onClick={onConfirm}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
