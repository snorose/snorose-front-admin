import type { UIEvent } from 'react';

import { History, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button, Dialog } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import {
  getPenaltyTone,
  isOngoingPenalty,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import { formatDateTime } from '@/domains/MemberInfo/utils/memberDirectory';

type PenaltyHistoryTimelineDialogProps = {
  hasNext: boolean;
  histories: BlacklistHistoryItem[];
  isLoading: boolean;
  member: MemberInfo;
  onAddDemotion: () => void;
  onAddWarning: () => void;
  onDelete: (history: BlacklistHistoryItem) => void;
  onEdit: (history: BlacklistHistoryItem) => void;
  onLoadMore: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  totalCount: number;
};

export default function PenaltyHistoryTimelineDialog({
  hasNext,
  histories,
  isLoading,
  member,
  onAddDemotion,
  onAddWarning,
  onDelete,
  onEdit,
  onLoadMore,
  onOpenChange,
  open,
  totalCount,
}: PenaltyHistoryTimelineDialogProps) {
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNext || isLoading) return;

    const target = event.currentTarget;
    const remainingScroll =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remainingScroll <= 80) {
      void onLoadMore();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='max-h-[calc(100vh-4rem)] overflow-hidden rounded-2xl p-0 sm:max-w-2xl'>
        <div className='flex max-h-[calc(100vh-4rem)] flex-col'>
          <Dialog.Header className='gap-3 px-8 pt-8'>
            <Dialog.Title className='flex items-center gap-3 text-2xl font-bold text-slate-950'>
              <History className='h-6 w-6' />
              제재 이력 타임라인
            </Dialog.Title>
            <Dialog.Description className='text-base text-slate-500'>
              {member.userName}({member.studentNumber})님의 전체 제재 이력을
              확인할 수 있습니다.
            </Dialog.Description>
          </Dialog.Header>

          <div className='grid grid-cols-2 gap-3 px-8 py-5'>
            <Button
              type='button'
              variant='outline'
              className='h-12 rounded-xl text-base font-semibold'
              onClick={onAddWarning}
            >
              <Plus className='h-5 w-5' />
              경고 추가
            </Button>
            <Button
              type='button'
              variant='outline'
              className='h-12 rounded-xl text-base font-semibold'
              onClick={onAddDemotion}
            >
              <Plus className='h-5 w-5' />
              강등 추가
            </Button>
          </div>

          <div className='border-t border-slate-200' />

          <div className='px-8 pt-5'>
            <p className='rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500'>
              전체 제재 이력 {totalCount.toLocaleString()}건
            </p>
          </div>

          <div
            className='min-h-0 flex-1 overflow-y-auto px-8 pt-5 pb-7'
            onScroll={handleScroll}
          >
            {histories.length > 0 ? (
              <>
                <ol className='relative space-y-7 border-l-2 border-slate-200 pl-7'>
                  {histories.map((history, index) => (
                    <PenaltyHistoryCard
                      key={`${history.createdAt}-${history.type}-${index}`}
                      history={history}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))}
                </ol>
                {isLoading ? (
                  <div className='mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    제재 이력을 불러오는 중입니다.
                  </div>
                ) : null}
              </>
            ) : (
              <div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-10 text-center text-sm font-semibold text-emerald-700'>
                {isLoading
                  ? '제재 이력을 불러오는 중입니다.'
                  : '제재 이력이 없습니다.'}
              </div>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function PenaltyHistoryCard({
  history,
  onDelete,
  onEdit,
}: {
  history: BlacklistHistoryItem;
  onDelete: (history: BlacklistHistoryItem) => void;
  onEdit: (history: BlacklistHistoryItem) => void;
}) {
  const isOngoing = isOngoingPenalty(history);
  // 경고 항목에는 강등 시작일/종료일이 없으므로(항상 '-') 해당 필드를 숨긴다.
  const isWarning = history.type === '경고' || history.type === 'WARNING';

  return (
    <li className='relative'>
      <span
        className={`absolute top-3 -left-[2.4375rem] h-5 w-5 rounded-full border-4 border-white shadow-sm ${
          isOngoing ? 'bg-rose-600' : 'bg-slate-950'
        }`}
      />
      <article
        className={`rounded-2xl border bg-white p-5 shadow-sm ${
          isOngoing ? 'border-rose-200 shadow-rose-100' : 'border-slate-200'
        }`}
      >
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className={`inline-flex rounded-lg border px-3 py-1 text-sm font-bold ${getPenaltyTone(
                history
              )}`}
            >
              {history.deletedAt ? '(삭제) ' : ''}
              {history.type}
            </span>
            {isOngoing ? (
              <span className='rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600'>
                진행중
              </span>
            ) : null}
            {history.deletedAt ? (
              <span className='text-sm font-medium text-slate-400'>취소됨</span>
            ) : null}
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={`text-sm font-semibold ${
                isOngoing ? 'text-rose-600' : 'text-slate-400'
              }`}
            >
              {formatDateTime(history.createdAt)}
            </span>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={() => onEdit(history)}
              className='rounded-lg text-slate-500 hover:text-slate-950'
              aria-label='제재 수정'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={() => onDelete(history)}
              className='rounded-lg text-rose-500 hover:text-rose-600'
              aria-label='제재 삭제'
              disabled={Boolean(history.deletedAt)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='mt-5 grid gap-4 sm:grid-cols-2'>
          <Info label='제재 사유' value={history.blackReason} />
          <Info label='관리자명' value={history.adminName} />
          {!isWarning ? (
            <>
              <Info label='강등 시작일' value={history.blacklistStartDate} />
              <Info label='강등 종료일' value={history.blacklistDeadline} />
            </>
          ) : null}
        </div>

        <div className='mt-5 space-y-2'>
          <p className='text-sm font-semibold text-slate-400'>운영자 메모</p>
          <p className='rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700'>
            {history.operatorMemo || '-'}
          </p>
        </div>

        {history.deletedAt ? (
          <div className='mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700'>
            <p className='font-bold'>취소 정보</p>
            <p className='mt-2 font-medium'>
              취소 사유: {history.deletedReason || '-'}
            </p>
            <p className='mt-1 text-rose-400'>
              취소 날짜: {formatDateTime(history.deletedAt)} | 취소자:{' '}
              {history.deletedBy || '-'}
            </p>
          </div>
        ) : null}
      </article>
    </li>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  const displayValue = label.includes('일') ? formatDateTime(value) : value;

  return (
    <div className='space-y-2'>
      <p className='text-sm font-semibold text-slate-400'>{label}</p>
      <p className='text-sm font-semibold text-slate-800'>
        {displayValue || '-'}
      </p>
    </div>
  );
}
