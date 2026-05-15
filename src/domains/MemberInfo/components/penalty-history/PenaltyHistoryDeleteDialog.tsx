import { AlertTriangle } from 'lucide-react';

import { Button, Dialog } from '@/shared/components/ui';
import type { BlacklistHistoryItem } from '@/shared/types';

import PenaltyHistoryField from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryField';
import { formatDateTime } from '@/domains/MemberInfo/utils/memberDirectory';

type PenaltyHistoryDeleteDialogProps = {
  deletingHistory: BlacklistHistoryItem | null;
  deleteReason: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  setDeleteReason: (value: string) => void;
};

export default function PenaltyHistoryDeleteDialog({
  deletingHistory,
  deleteReason,
  onConfirm,
  onOpenChange,
  setDeleteReason,
}: PenaltyHistoryDeleteDialogProps) {
  return (
    <Dialog open={Boolean(deletingHistory)} onOpenChange={onOpenChange}>
      <Dialog.Content className='rounded-2xl sm:max-w-xl'>
        <Dialog.Header>
          <Dialog.Title className='flex items-center gap-2 text-2xl text-rose-600'>
            <AlertTriangle className='h-6 w-6' />
            제재 취소
          </Dialog.Title>
          <Dialog.Description className='text-base'>
            취소된 제재는 타임라인에서 삭제되지 않고 앞에 (삭제) 표시가
            붙습니다. 메모란에 취소 사유를 반드시 작성해주세요.
          </Dialog.Description>
        </Dialog.Header>

        {deletingHistory ? <DeleteSummary history={deletingHistory} /> : null}

        <PenaltyHistoryField label='취소 사유'>
          <textarea
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            placeholder='취소 사유를 입력하세요'
            className='min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200'
          />
        </PenaltyHistoryField>

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
            className='rounded-xl bg-rose-600 text-white hover:bg-rose-700'
            onClick={onConfirm}
          >
            제재 취소
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function DeleteSummary({ history }: { history: BlacklistHistoryItem }) {
  return (
    <div className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-7 font-semibold text-slate-900'>
      <p>제재 종류: {history.type}</p>
      <p>제재 날짜: {formatDateTime(history.createdAt)}</p>
      <p>강등 시작일: {formatDateTime(history.blacklistStartDate)}</p>
      <p>강등 종료일: {formatDateTime(history.blacklistDeadline)}</p>
      <p>제재 사유: {history.blackReason}</p>
      <p>기존 메모: {history.operatorMemo || '-'}</p>
    </div>
  );
}
