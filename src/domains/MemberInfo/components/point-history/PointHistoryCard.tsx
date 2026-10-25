import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ArrowUpRight } from 'lucide-react';

import { CopyableValue } from '@/shared/components';
import type { MemberPointHistory } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  getPointCategoryLabel,
  getPointDetailLabel,
  getPointSourceLabel,
} from './point-history-labels';
import { getPointSourceTarget } from './point-history-source';

type PointHistoryCardProps = {
  history: MemberPointHistory;
};

export default function PointHistoryCard({ history }: PointHistoryCardProps) {
  const isDeduction = history.difference < 0;
  const categoryLabel = getPointCategoryLabel(history.category);
  const sourceLabel = getPointSourceLabel(history.source);
  const detailLabel = getPointDetailLabel(history.category, history.source);
  const sourceTarget = getPointSourceTarget(history);

  return (
    <li className='relative' aria-label={`포인트 로그 ${history.id}`}>
      <span
        aria-hidden='true'
        className={`bg-background absolute top-4 -left-[1.4375rem] size-3 rounded-full border-2 ${
          isDeduction ? 'border-rose-600' : 'border-foreground'
        }`}
      />
      <article className='border-border bg-background rounded-md border p-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span
              className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${
                isDeduction
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-border text-foreground'
              }`}
            >
              {isDeduction
                ? '차감'
                : history.difference === 0
                  ? '변동 없음'
                  : '지급'}
            </span>
            <p
              className={`text-lg font-semibold tabular-nums ${
                isDeduction ? 'text-rose-600' : 'text-foreground'
              }`}
            >
              {history.difference > 0 ? '+' : ''}
              {history.difference.toLocaleString()}P
            </p>
          </div>
          <time
            dateTime={history.createdAt}
            title={history.createdAt.replace('T', ' ')}
            className='text-muted-foreground text-xs'
          >
            {formatDateTimeToMinutes(history.createdAt)}
          </time>
        </div>

        <dl className='mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2'>
          <Info label='포인트 유형'>{categoryLabel}</Info>
          <Info label='출처'>{sourceLabel}</Info>
          <Info label='로그 ID'>
            <CopyableValue label='로그 ID' value={history.id} />
          </Info>
          <Info label={sourceTarget.idLabel}>
            {history.sourceId != null ? (
              sourceTarget.href ? (
                <Link
                  to={sourceTarget.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-muted-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:outline-none'
                  aria-label={`${sourceTarget.idLabel} ${history.sourceId}로 이동 (새 탭)`}
                  title={`${sourceTarget.actionLabel} (새 탭)`}
                >
                  <span className='underline underline-offset-4'>
                    {history.sourceId}
                  </span>
                  <ArrowUpRight
                    className='size-3.5 shrink-0'
                    aria-hidden='true'
                  />
                </Link>
              ) : (
                <CopyableValue
                  label={sourceTarget.idLabel}
                  value={history.sourceId}
                />
              )
            ) : (
              <span className='text-muted-foreground'>-</span>
            )}
          </Info>

          <div className='space-y-1 sm:col-span-2'>
            <dt className='text-muted-foreground text-xs font-medium'>
              {detailLabel}
            </dt>
            <dd className='bg-muted text-foreground rounded-md px-3 py-2 text-sm break-words whitespace-pre-wrap'>
              {history.sourceDetail ?? '-'}
            </dd>
          </div>
        </dl>
      </article>
    </li>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 space-y-1'>
      <dt className='text-muted-foreground text-xs font-medium'>{label}</dt>
      <dd className='text-foreground text-sm break-words'>{children}</dd>
    </div>
  );
}
