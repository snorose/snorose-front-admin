import { Fragment, useState } from 'react';

import { History, ShieldAlert } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button, Separator } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import { SectionCard } from '@/domains/MemberInfo/components/MemberDetailCard';
import MemberPenaltyHistoryDialog from '@/domains/MemberInfo/components/MemberPenaltyHistoryDialog';
import {
  isOngoingPenalty,
  isWarningType,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
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
  const ongoingDemotion = penaltyHistory.find(isOngoingPenalty);
  // 강등 중 새 경고가 추가되면 users API의 제재 상세 필드가 최신 경고를
  // 가리킬 수 있다. 이때 경고 정보를 강등 정보로 오표시하지 않고,
  // 조회된 이력의 진행 중 강등 정보를 사용한다.
  const demotionReason = latestPayloadIsWarning
    ? ongoingDemotion?.blackReason
    : member.blacklistReason;
  const demotionStartDate = latestPayloadIsWarning
    ? (ongoingDemotion?.blacklistStartDate ?? ongoingDemotion?.createdAt)
    : member.blacklistStartDate;
  const demotionEndDate = latestPayloadIsWarning
    ? ongoingDemotion?.blacklistDeadline
    : member.blacklistEndDate;
  const remainingPenaltyLabel = getRemainingPenaltyLabel(demotionEndDate);
  const details = [
    { label: '경고 사유', value: isWarning ? member.blacklistReason : null },
    {
      label: '마지막 경고일',
      value:
        isWarning && member.blacklistStartDate
          ? formatDateTimeToMinutes(member.blacklistStartDate)
          : null,
    },
    { label: '강등 사유', value: isDemotion ? demotionReason : null },
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
                  <dd className='text-foreground min-w-0 wrap-break-word'>
                    {value}
                  </dd>
                </dl>
              </Fragment>
            ))}
          </div>

          {isDemotion && latestPayloadIsWarning && !ongoingDemotion ? (
            <p className='text-muted-foreground text-sm leading-6'>
              강등 상세 정보는 제재 이력에서 확인할 수 있습니다.
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
