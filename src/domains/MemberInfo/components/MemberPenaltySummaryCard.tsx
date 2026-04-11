import { ShieldAlert } from 'lucide-react';

import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import {
  InfoBlock,
  SectionCard,
} from '@/domains/MemberInfo/components/MemberDetailCard';
import {
  formatDateTime,
  getPenaltyStatus,
  getRemainingPenaltyLabel,
} from '@/domains/MemberInfo/utils/memberDirectory';

type MemberPenaltySummaryCardProps = {
  latestPenaltyHistory: BlacklistHistoryItem | null;
  member: MemberInfo;
};

export default function MemberPenaltySummaryCard({
  latestPenaltyHistory,
  member,
}: MemberPenaltySummaryCardProps) {
  const penaltyStatus = getPenaltyStatus(member);
  const hasActivePenalty = Boolean(member.isBlacklist);
  const remainingPenaltyLabel = getRemainingPenaltyLabel(
    member.blacklistEndDate
  );

  return (
    <SectionCard icon={ShieldAlert} title='제재 상태 요약'>
      <div className='space-y-6'>
        <div className='space-y-3'>
          <p className='text-sm font-medium text-slate-500'>현재 상태</p>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${penaltyStatus.tone}`}
          >
            {penaltyStatus.label}
          </span>
        </div>

        {hasActivePenalty && latestPenaltyHistory?.blackReason ? (
          <InfoBlock
            label='강등 사유'
            value={latestPenaltyHistory.blackReason}
            tone='muted'
          />
        ) : null}

        {hasActivePenalty && member.blacklistStartDate ? (
          <InfoBlock
            label='강등 시작일'
            value={formatDateTime(member.blacklistStartDate)}
            valueClassName='text-rose-600'
          />
        ) : null}

        {hasActivePenalty && member.blacklistEndDate ? (
          <InfoBlock
            label='강등 종료일'
            value={formatDateTime(member.blacklistEndDate)}
          />
        ) : null}

        {hasActivePenalty && member.blacklistEndDate ? (
          <InfoBlock label='남은 기간' value={remainingPenaltyLabel} />
        ) : null}

        <div className='space-y-2'>
          <p className='text-sm font-medium text-slate-500'>누적 경고 수</p>
          <p
            className={`text-3xl font-bold ${
              member.totalWarningCount > 0 ? 'text-rose-600' : 'text-slate-950'
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
  );
}
