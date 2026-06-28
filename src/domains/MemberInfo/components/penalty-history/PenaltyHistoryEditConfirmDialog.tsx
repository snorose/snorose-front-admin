import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import {
  isPermanentDemotionType,
  isWarningType,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import type { PenaltyEditForm } from '@/domains/MemberInfo/components/penalty-history/usePenaltyHistoryDialogState';
import { formatDateTime } from '@/domains/MemberInfo/utils/memberDirectory';

type PenaltyHistoryEditConfirmDialogProps = {
  editForm: PenaltyEditForm;
  getEditEndAt: () => string | null;
  member: MemberInfo;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function PenaltyHistoryEditConfirmDialog({
  editForm,
  getEditEndAt,
  member,
  onConfirm,
  onOpenChange,
  open,
}: PenaltyHistoryEditConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='rounded-2xl sm:max-w-md'>
        <Dialog.Header>
          <Dialog.Title className='text-xl'>수정 확인</Dialog.Title>
          <Dialog.Description className='text-base leading-7'>
            {getConfirmMessage({ editForm, getEditEndAt, member })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            type='button'
            variant='outline'
            className='rounded-xl'
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type='button'
            className='rounded-xl bg-slate-950 text-white hover:bg-slate-800'
            onClick={onConfirm}
          >
            확인
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function getConfirmMessage({
  editForm,
  getEditEndAt,
  member,
}: {
  editForm: PenaltyEditForm;
  getEditEndAt: () => string | null;
  member: MemberInfo;
}) {
  if (isWarningType(editForm.type)) {
    const warningCount = Math.max(1, Number(editForm.warningCount) || 1);
    return `${member.userName}(${member.studentNumber}) 회원을 경고 ${warningCount}회로 수정하시겠습니까?`;
  }

  const endAt = getEditEndAt();
  const durationLabel = isPermanentDemotionType(editForm.type)
    ? '영구 강등'
    : `${Math.max(1, Number(editForm.durationDays) || 1)}일 동안 강등`;

  return `${member.userName}(${member.studentNumber}) 회원을 ${durationLabel}으로 수정하시겠습니까?${
    endAt ? ` 종료 일자는 ${formatDateTime(endAt)} 입니다.` : ''
  }`;
}
