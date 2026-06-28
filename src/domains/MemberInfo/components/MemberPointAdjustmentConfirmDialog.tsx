import type { ReactNode } from 'react';

import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

type MemberPointAdjustmentConfirmDialogProps = {
  category: string;
  difference: string;
  isSubmitting: boolean;
  member: MemberInfo;
  memo: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
};

export default function MemberPointAdjustmentConfirmDialog({
  category,
  difference,
  isSubmitting,
  member,
  memo,
  onClose,
  onConfirm,
  open,
}: MemberPointAdjustmentConfirmDialogProps) {
  const isPositiveDifference = Number(difference) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Content className='rounded-2xl sm:max-w-md'>
        <Dialog.Header>
          <Dialog.Title>포인트 지급/차감 확인</Dialog.Title>
          <Dialog.Description>
            아래 내용으로 포인트를 적용하시겠습니까?
          </Dialog.Description>
        </Dialog.Header>

        <div className='space-y-3 py-2 text-sm'>
          <ConfirmRow label='아이디' value={member.loginId} />
          <ConfirmRow label='이름' value={member.userName} />
          <ConfirmRow label='학과' value={member.major} />
          <ConfirmRow label='학번' value={member.studentNumber} />
          <ConfirmRow label='포인트 유형' value={category} />
          <div className='flex items-center gap-2'>
            <span className='font-semibold'>포인트 지급/차감량:</span>
            <span
              className={
                isPositiveDifference ? 'text-blue-600' : 'text-red-600'
              }
            >
              {isPositiveDifference ? '+' : ''}
              {difference}
            </span>
          </div>
          <ConfirmRow label='메모' value={memo} />
        </div>

        <Dialog.Footer>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type='button' onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '확인'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function ConfirmRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className='flex items-center gap-2'>
      <span className='font-semibold'>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
