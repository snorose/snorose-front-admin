import { useState } from 'react';

import { History, ShieldAlert } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  InfoBlock,
  SectionCard,
} from '@/domains/MemberInfo/components/MemberDetailCard';
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

  return (
    <>
      <SectionCard
        icon={ShieldAlert}
        title='제재 상태 요약'
        action={
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => {
              void onOpenPenaltyHistory?.();
              setIsHistoryOpen(true);
            }}
            className='rounded-xl text-slate-600'
            aria-label='강등/경고 히스토리 열기'
          >
            <History className='h-5 w-5' />
          </Button>
        }
      >
        <div className='space-y-6'>
          <div className='space-y-3'>
            <p className='text-sm font-medium text-slate-500'>현재 상태</p>
            <div className='flex flex-wrap items-center gap-2'>
              <StatusBadge tone={penaltyStatus.tone}>
                {penaltyStatus.label}
              </StatusBadge>
              {penaltyStatus.warningBadge ? (
                <StatusBadge tone={penaltyStatus.warningBadge.tone}>
                  {penaltyStatus.warningBadge.label}
                </StatusBadge>
              ) : null}
            </div>
          </div>

          {isWarning && member.blacklistReason ? (
            <InfoBlock
              label='경고 사유'
              value={member.blacklistReason}
              tone='muted'
            />
          ) : null}

          {isWarning && member.blacklistStartDate ? (
            <InfoBlock
              label='마지막 경고일'
              value={formatDateTimeToMinutes(member.blacklistStartDate)}
            />
          ) : null}

          {isDemotion && demotionReason ? (
            <InfoBlock label='강등 사유' value={demotionReason} tone='muted' />
          ) : null}

          {isDemotion && demotionStartDate ? (
            <InfoBlock
              label='강등 시작일'
              value={formatDateTimeToMinutes(demotionStartDate)}
              valueClassName='text-rose-600'
            />
          ) : null}

          {isDemotion && demotionEndDate ? (
            <InfoBlock
              label='강등 종료일'
              value={formatDateTimeToMinutes(demotionEndDate)}
            />
          ) : null}

          {isDemotion && demotionEndDate ? (
            <InfoBlock label='남은 기간' value={remainingPenaltyLabel} />
          ) : null}

          {isDemotion && latestPayloadIsWarning && !ongoingDemotion ? (
            <p className='rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600'>
              강등 상세 정보는 제재 이력에서 확인할 수 있습니다.
            </p>
          ) : null}

          <div className='space-y-2'>
            <p className='text-sm font-medium text-slate-500'>누적 경고 수</p>
            <p
              className={`text-3xl font-bold ${
                member.totalWarningCount > 0
                  ? 'text-rose-600'
                  : 'text-slate-950'
              }`}
            >
              {member.totalWarningCount}
              <span className='ml-1 text-lg font-semibold text-slate-500'>
                회
              </span>
            </p>
          </div>

          <div
            className={`rounded-2xl px-4 py-5 text-sm font-medium ${penaltyStatus.summaryTone}`}
          >
            {penaltyStatus.summary}
          </div>
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
