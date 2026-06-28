import { Loader2 } from 'lucide-react';

import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import type { DemotionType } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';

type PenaltyHistoryAddConfirmDialogProps = {
  demotionType: DemotionType;
  isSubmitting: boolean;
  isWarningMode: boolean;
  member: MemberInfo;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  relegationEndDateTime: string;
  relegationMonth: number;
  warningCount: number;
};

export default function PenaltyHistoryAddConfirmDialog({
  demotionType,
  isSubmitting,
  isWarningMode,
  member,
  onConfirm,
  onOpenChange,
  open,
  relegationEndDateTime,
  relegationMonth,
  warningCount,
}: PenaltyHistoryAddConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='rounded-2xl p-0 sm:max-w-xl'>
        <div className='space-y-7 px-8 py-8'>
          <Dialog.Header>
            <Dialog.Title className='text-xl leading-8 font-bold text-slate-950'>
              <ConfirmTitle
                demotionType={demotionType}
                isWarningMode={isWarningMode}
                member={member}
                relegationEndDateTime={relegationEndDateTime}
                relegationMonth={relegationMonth}
                warningCount={warningCount}
              />
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Footer className='gap-2'>
            <Button
              type='button'
              variant='outline'
              className='h-12 rounded-xl px-6 text-base font-semibold text-slate-950'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type='button'
              className='h-12 rounded-xl bg-slate-950 px-6 text-base font-bold text-white hover:bg-slate-800'
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className='h-5 w-5 animate-spin' />
              ) : null}
              확인
            </Button>
          </Dialog.Footer>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function ConfirmTitle({
  demotionType,
  isWarningMode,
  member,
  relegationEndDateTime,
  relegationMonth,
  warningCount,
}: {
  demotionType: DemotionType;
  isWarningMode: boolean;
  member: MemberInfo;
  relegationEndDateTime: string;
  relegationMonth: number;
  warningCount: number;
}) {
  if (isWarningMode) {
    return (
      <>
        {member.userName}({member.studentNumber}) 회원을{' '}
        <span className='text-rose-600'>{warningCount}회</span> 경고
        적용하시겠습니까?
      </>
    );
  }

  if (demotionType === 'BLACKLIST') {
    return (
      <>
        {member.userName}({member.studentNumber}) 회원을{' '}
        <span className='text-rose-600'>영구강등</span>하시겠습니까?
      </>
    );
  }

  return (
    <>
      {member.userName}({member.studentNumber}) 회원을{' '}
      <span className='text-rose-600'>{relegationMonth}개월</span> 동안
      강등하시겠습니까? 종료 일자는{' '}
      <span className='text-rose-600'>{relegationEndDateTime}</span> 입니다.
    </>
  );
}
