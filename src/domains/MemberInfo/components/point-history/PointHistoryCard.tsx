import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ArrowUpRight, Copy } from 'lucide-react';

import { Button } from '@/shared/components/ui';
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
  onCopy: (value: string) => void | Promise<void>;
};

export default function PointHistoryCard({
  history,
  onCopy,
}: PointHistoryCardProps) {
  const isDeduction = history.difference < 0;
  const categoryLabel = getPointCategoryLabel(history.category);
  const sourceLabel = getPointSourceLabel(history.source);
  const detailLabel = getPointDetailLabel(history.category, history.source);
  const sourceTarget = getPointSourceTarget(history);

  return (
    <li className='relative' aria-label={`포인트 로그 ${history.id}`}>
      <span
        aria-hidden='true'
        className={`absolute top-0 -left-[2.125rem] size-5 rounded-full border-[3px] bg-white sm:-left-[2.375rem] ${
          isDeduction ? 'border-rose-600' : 'border-zinc-950'
        }`}
      />
      <article className='rounded-2xl border border-zinc-200 bg-white p-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <span
              className={`rounded-xl border px-3 py-1 text-sm font-medium ${
                isDeduction
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-zinc-200 text-zinc-950'
              }`}
            >
              {isDeduction
                ? '차감'
                : history.difference === 0
                  ? '변동 없음'
                  : '지급'}
            </span>
            <p
              className={`text-xl font-bold sm:text-2xl ${
                isDeduction ? 'text-rose-600' : 'text-zinc-950'
              }`}
            >
              {history.difference > 0 ? '+' : ''}
              {history.difference.toLocaleString()}P
            </p>
          </div>
          <time
            dateTime={history.createdAt}
            title={history.createdAt.replace('T', ' ')}
            className='text-sm font-medium text-zinc-500'
          >
            {formatDateTimeToMinutes(history.createdAt)}
          </time>
        </div>

        <dl className='mt-5 grid grid-cols-2 gap-x-6 gap-y-5'>
          <Info label='포인트 유형'>{categoryLabel}</Info>
          <Info label='출처'>{sourceLabel}</Info>
          <Info label='로그 ID'>
            <CopyId label='로그 ID' value={history.id} onCopy={onCopy} />
          </Info>
          <Info label={sourceTarget.idLabel}>
            {history.sourceId != null ? (
              sourceTarget.href ? (
                <Link
                  to={sourceTarget.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 rounded-sm hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none'
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
                <CopyId
                  label={sourceTarget.idLabel}
                  value={history.sourceId}
                  onCopy={onCopy}
                />
              )
            ) : (
              <span className='text-zinc-500'>-</span>
            )}
          </Info>

          <div className='col-span-2 space-y-2'>
            <dt className='text-sm font-medium text-zinc-500'>{detailLabel}</dt>
            <dd className='rounded-xl bg-[#ecebf0] px-4 py-3 text-base break-words whitespace-pre-wrap text-zinc-950'>
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
    <div className='min-w-0 space-y-2'>
      <dt className='text-sm font-medium text-zinc-500'>{label}</dt>
      <dd className='text-base font-medium break-words text-zinc-950'>
        {children}
      </dd>
    </div>
  );
}

function CopyId({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: number;
  onCopy: PointHistoryCardProps['onCopy'];
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={() => void onCopy(String(value))}
      className='h-auto justify-start rounded-sm p-0 text-base text-zinc-500 hover:text-zinc-950 has-[>svg]:px-0'
      aria-label={`${label} ${value} 복사`}
      title={`${label} 복사`}
    >
      <span>{value}</span>
      <Copy className='size-3.5 shrink-0' aria-hidden='true' />
    </Button>
  );
}
