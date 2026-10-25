import { Fragment, useState } from 'react';

import { History, ShieldAlert } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button, Separator } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import { SectionCard } from '@/domains/MemberInfo/components/MemberDetailCard';
import MemberPenaltyHistoryDialog from '@/domains/MemberInfo/components/MemberPenaltyHistoryDialog';
import { isWarningType } from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import {
  getPenaltyStatus,
  getRemainingPenaltyLabel,
  isWarningPenalty,
} from '@/domains/MemberInfo/utils/memberDirectory';

type MemberPenaltySummaryCardProps = {
  hasNextPenaltyHistory: boolean;
  isPenaltyHistoryLoading: boolean;
  penaltyHistory: BlacklistHistoryItem[];
  penaltyHistoryTotalCount: number;
  member: MemberInfo;
  onChangedPenaltyHistory?: () => void | Promise<void>;
  onLoadMorePenaltyHistory: () => void | Promise<void>;
  onOpenPenaltyHistory?: () => void | Promise<void>;
};

const SUMMARY_ROW_CLASS_NAME =
  'grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3';

export default function MemberPenaltySummaryCard({
  hasNextPenaltyHistory,
  isPenaltyHistoryLoading,
  penaltyHistory,
  penaltyHistoryTotalCount,
  member,
  onChangedPenaltyHistory,
  onLoadMorePenaltyHistory,
  onOpenPenaltyHistory,
}: MemberPenaltySummaryCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const penaltyStatus = getPenaltyStatus(member);
  const hasActivePenalty = Boolean(member.isBlacklist);
  const isWarning = isWarningPenalty(member);
  const isDemotion = hasActivePenalty && !isWarning;
  const latestPayloadIsWarning = isWarningType(member.blacklistType ?? '');
  const blacklistReasons = member.blacklistReasons?.join('\n');
  // 최신 경고의 시작일을 강등 시작일로 표시하지 않는다.
  // 종료일은 서버가 제공하는 값만 사용하고 이력의 개월 수로 추정하지 않는다.
  const demotionStartDate = latestPayloadIsWarning
    ? null
    : member.blacklistStartDate;
  const demotionEndDate = member.blacklistEndDate;
  const remainingPenaltyLabel = getRemainingPenaltyLabel(demotionEndDate);
  const details = [
    { label: '제재 사유', value: hasActivePenalty ? blacklistReasons : null },
    {
      label: '마지막 경고일',
      value:
        isWarning && member.blacklistStartDate
          ? formatDateTimeToMinutes(member.blacklistStartDate)
          : null,
    },
    {
      label: '강등 시작일',
      value:
        isDemotion && demotionStartDate
          ? formatDateTimeToMinutes(demotionStartDate)
          : null,
    },
    {
      label: '강등 종료일',
      value:
        isDemotion && demotionEndDate
          ? formatDateTimeToMinutes(demotionEndDate)
          : null,
    },
    {
      label: '남은 기간',
      value: isDemotion && demotionEndDate ? remainingPenaltyLabel : null,
    },
  ].filter(({ value }) => Boolean(value));

  return (
    <>
      <SectionCard
        icon={ShieldAlert}
        title='제재 상태 요약'
        action={
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              void onOpenPenaltyHistory?.();
              setIsHistoryOpen(true);
            }}
            className='h-9'
            aria-label='제재 이력 열기'
          >
            <History aria-hidden='true' />
            제재 이력
          </Button>
        }
      >
        <div className='space-y-3'>
          <div className='text-sm leading-6'>
            <dl className={SUMMARY_ROW_CLASS_NAME}>
              <dt className='text-muted-foreground'>현재 상태</dt>
              <dd className='flex min-h-6 min-w-0 flex-wrap items-center gap-1.5'>
                <StatusBadge tone={penaltyStatus.tone}>
                  {penaltyStatus.label}
                </StatusBadge>
                {penaltyStatus.warningBadge ? (
                  <StatusBadge tone={penaltyStatus.warningBadge.tone}>
                    {penaltyStatus.warningBadge.label}
                  </StatusBadge>
                ) : null}
              </dd>
            </dl>
            <Separator className='my-2' />
            <dl className={SUMMARY_ROW_CLASS_NAME}>
              <dt className='text-muted-foreground'>누적 경고 수</dt>
              <dd
                className={`font-medium tabular-nums ${
                  member.totalWarningCount > 0
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}
              >
                {member.totalWarningCount}
                <span className='text-muted-foreground ml-1 font-normal'>
                  회
                </span>
              </dd>
            </dl>
            {details.map(({ label, value }) => (
              <Fragment key={label}>
                <Separator className='my-3' />
                <dl className={SUMMARY_ROW_CLASS_NAME}>
                  <dt className='text-muted-foreground'>{label}</dt>
                  <dd className='text-foreground min-w-0 wrap-break-word whitespace-pre-line'>
                    {value}
                  </dd>
                </dl>
              </Fragment>
            ))}
          </div>

          {isDemotion && latestPayloadIsWarning && !demotionEndDate ? (
            <p className='text-muted-foreground text-sm leading-6'>
              강등 기간은 제재 이력에서 확인할 수 있습니다.
            </p>
          ) : null}

          <p
            className={`rounded-md px-3 py-3 text-sm leading-6 font-medium ${penaltyStatus.summaryTone}`}
          >
            {penaltyStatus.summary}
          </p>
        </div>
      </SectionCard>

      <MemberPenaltyHistoryDialog
        hasNext={hasNextPenaltyHistory}
        histories={penaltyHistory}
        isLoading={isPenaltyHistoryLoading}
        member={member}
        onChanged={onChangedPenaltyHistory}
        onLoadMore={onLoadMorePenaltyHistory}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        totalCount={penaltyHistoryTotalCount}
      />
    </>
  );
}
