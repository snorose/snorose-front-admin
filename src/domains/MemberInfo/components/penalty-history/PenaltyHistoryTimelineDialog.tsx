import type { UIEvent } from 'react';

import { History, Loader2, Plus, Trash2 } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button, Dialog } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  PENALTY_ADD_BLOCKED_MESSAGE,
  isPenaltyAddTemporarilyBlocked,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';
import {
  getPenaltyBadgeMeta,
  getPenaltyProgressBadgeMeta,
  isOngoingPenalty,
  isPermanentDemotionType,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';

type PenaltyHistoryTimelineDialogProps = {
  canAddWarning: boolean;
  hasNext: boolean;
  histories: BlacklistHistoryItem[];
  isLoading: boolean;
  member: MemberInfo;
  onAddDemotion: () => void;
  onAddWarning: () => void;
  onDelete: (history: BlacklistHistoryItem) => void;
  onLoadMore: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  totalCount: number;
};

export default function PenaltyHistoryTimelineDialog({
  canAddWarning,
  hasNext,
  histories,
  isLoading,
  member,
  onAddDemotion,
  onAddWarning,
  onDelete,
  onLoadMore,
  onOpenChange,
  open,
  totalCount,
}: PenaltyHistoryTimelineDialogProps) {
  const isPenaltyBlocked = isPenaltyAddTemporarilyBlocked(member);
  const warningBlockedMessage = isPenaltyBlocked
    ? PENALTY_ADD_BLOCKED_MESSAGE
    : !canAddWarning
      ? '영구강등 회원에게는 경고를 추가할 수 없습니다.'
      : undefined;

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
      <Dialog.Content className='max-h-[calc(100dvh-4rem)] gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <div className='flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col'>
          <Dialog.Header className='shrink-0 gap-2 px-6 pt-5 text-left'>
            <Dialog.Title className='flex items-center gap-2 pr-6'>
              <History className='size-4 shrink-0' aria-hidden='true' />
              제재 이력 타임라인
            </Dialog.Title>
            <Dialog.Description>
              {member.userName}({member.studentNumber})님의 전체 제재 이력을
              확인할 수 있습니다.
            </Dialog.Description>
          </Dialog.Header>

          <div className='grid shrink-0 grid-cols-2 gap-2 px-6 py-4'>
            <Button
              type='button'
              variant='destructive-outline'
              size='sm'
              onClick={onAddWarning}
              disabled={isPenaltyBlocked || !canAddWarning}
              title={warningBlockedMessage}
            >
              <Plus aria-hidden='true' />
              경고 추가
            </Button>
            <Button
              type='button'
              variant='destructive-outline'
              size='sm'
              onClick={onAddDemotion}
              disabled={isPenaltyBlocked}
              title={isPenaltyBlocked ? PENALTY_ADD_BLOCKED_MESSAGE : undefined}
            >
              <Plus aria-hidden='true' />
              강등 추가
            </Button>
          </div>

          {isPenaltyBlocked ? (
            <p
              role='alert'
              className='shrink-0 px-6 pb-4 text-sm text-rose-600'
            >
              {PENALTY_ADD_BLOCKED_MESSAGE}
            </p>
          ) : !canAddWarning ? (
            <p className='shrink-0 px-6 pb-4 text-sm text-rose-600'>
              {warningBlockedMessage}
            </p>
          ) : null}

          <div className='shrink-0 border-t' />

          <div className='shrink-0 px-6 pt-4'>
            <p className='text-muted-foreground text-xs'>
              전체 제재 이력 {totalCount.toLocaleString()}건
            </p>
          </div>

          <div
            className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-3 pb-5'
            aria-label='제재 이력'
            aria-busy={isLoading}
            onScroll={handleScroll}
          >
            {histories.length > 0 ? (
              <>
                <ol className='border-border relative ml-1.5 space-y-4 border-l pl-4'>
                  {histories.map((history, index) => (
                    <PenaltyHistoryCard
                      key={`${history.createdAt}-${history.type}-${index}`}
                      history={history}
                      onDelete={onDelete}
                    />
                  ))}
                </ol>
                {isLoading ? (
                  <div
                    role='status'
                    className='text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm'
                  >
                    <Loader2
                      className='size-4 animate-spin'
                      aria-hidden='true'
                    />
                    제재 이력을 불러오는 중입니다.
                  </div>
                ) : null}
              </>
            ) : (
              <div
                role='status'
                className='bg-muted text-muted-foreground rounded-md px-4 py-10 text-center text-sm'
              >
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
}: {
  history: BlacklistHistoryItem;
  onDelete: (history: BlacklistHistoryItem) => void;
}) {
  const isOngoing = isOngoingPenalty(history);
  const isPermanentDemotion = isPermanentDemotionType(history.type);
  const penaltyBadge = getPenaltyBadgeMeta(history);
  const progressBadge = getPenaltyProgressBadgeMeta(history);
  // 경고 항목에는 강등 시작일/종료일이 없으므로(항상 '-') 해당 필드를 숨긴다.
  const isWarning = history.type === '경고' || history.type === 'WARNING';

  return (
    <li className='relative'>
      <span
        aria-hidden='true'
        className={`bg-background absolute top-4 -left-[1.4375rem] size-3 rounded-full border-2 ${
          isOngoing && !isPermanentDemotion
            ? 'border-rose-600'
            : 'border-foreground'
        }`}
      />
      <article
        className={`bg-background rounded-md border p-4 pt-3 ${
          isOngoing ? 'border-rose-200' : 'border-border'
        }`}
      >
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <StatusBadge tone={penaltyBadge.tone}>
              {penaltyBadge.label}
            </StatusBadge>
            {progressBadge ? (
              <StatusBadge tone={progressBadge.tone}>
                {progressBadge.label}
              </StatusBadge>
            ) : null}
          </div>
          <div className='flex items-center gap-1'>
            <time
              dateTime={history.createdAt}
              title={history.createdAt.replace('T', ' ')}
              className='text-muted-foreground text-xs font-normal whitespace-nowrap tabular-nums'
            >
              {formatDateTimeToMinutes(history.createdAt)}
            </time>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={() => onDelete(history)}
              className='text-destructive hover:text-destructive'
              aria-label='제재 삭제 요청 안내'
              title='제재 삭제는 담당자 요청이 필요합니다.'
              disabled={Boolean(history.deletedAt)}
            >
              <Trash2 className='size-4' aria-hidden='true' />
            </Button>
          </div>
        </div>

        <dl className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2'>
          <Info label='제재 사유' value={history.blackReason} />
          <Info label='관리자명' value={history.adminName} />
          {!isWarning ? (
            <>
              <Info label='강등 시작일' value={history.blacklistStartDate} />
              <Info label='강등 종료일' value={history.blacklistDeadline} />
            </>
          ) : null}
          {hasDetail(history.operatorMemo) ? (
            <Info label='운영자 메모' value={history.operatorMemo} fullWidth />
          ) : null}
        </dl>

        {history.deletedAt ? (
          <section className='mt-3 border-t pt-3' aria-label='취소 정보'>
            <h3 className='text-muted-foreground mb-2 text-xs font-medium'>
              취소 정보
            </h3>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-2'>
              <Info label='취소 날짜' value={history.deletedAt} />
              <Info label='취소자' value={history.deletedBy} />
              {hasDetail(history.deletedReason) ? (
                <Info
                  label='취소 사유'
                  value={history.deletedReason}
                  fullWidth
                />
              ) : null}
            </dl>
          </section>
        ) : null}
      </article>
    </li>
  );
}

function hasDetail(value?: string | null) {
  const detail = value?.trim();
  return Boolean(detail && detail !== '-');
}

function Info({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  const displayValue =
    label.includes('일') || label === '취소 날짜'
      ? formatDateTimeToMinutes(value)
      : value;

  return (
    <div
      className={
        fullWidth
          ? 'col-span-2 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2'
          : 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5'
      }
    >
      <dt className='text-muted-foreground shrink-0 text-xs font-medium'>
        {label}
      </dt>
      <dd className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
        {displayValue || '-'}
      </dd>
    </div>
  );
}
