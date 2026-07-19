import { useState } from 'react';

import { History, ShieldAlert } from 'lucide-react';

import { Button } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import {
  InfoBlock,
  SectionCard,
} from '@/domains/MemberInfo/components/MemberDetailCard';
import MemberPenaltyHistoryDialog from '@/domains/MemberInfo/components/MemberPenaltyHistoryDialog';
import {
  formatDateTime,
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
  // users API의 blacklistReason/blacklistStartDate는 '현재 활성 제재'의 정보다.
  // 경고면 경고 사유/마지막 경고일, 강등이면 강등 사유/시작일이 담긴다.
  const isWarning = isWarningPenalty(member);
  const isDemotion = hasActivePenalty && !isWarning;
  const remainingPenaltyLabel = getRemainingPenaltyLabel(
    member.blacklistEndDate
  );

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
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${penaltyStatus.tone}`}
            >
              {penaltyStatus.label}
            </span>
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
              value={formatDateTime(member.blacklistStartDate)}
            />
          ) : null}

          {isDemotion && member.blacklistReason ? (
            <InfoBlock
              label='강등 사유'
              value={member.blacklistReason}
              tone='muted'
            />
          ) : null}

          {isDemotion && member.blacklistStartDate ? (
            <InfoBlock
              label='강등 시작일'
              value={formatDateTime(member.blacklistStartDate)}
              valueClassName='text-rose-600'
            />
          ) : null}

          {isDemotion && member.blacklistEndDate ? (
            <InfoBlock
              label='강등 종료일'
              value={formatDateTime(member.blacklistEndDate)}
            />
          ) : null}

          {isDemotion && member.blacklistEndDate ? (
            <InfoBlock label='남은 기간' value={remainingPenaltyLabel} />
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
            className={`rounded-2xl px-4 py-5 text-sm font-medium ${
              hasActivePenalty
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
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
