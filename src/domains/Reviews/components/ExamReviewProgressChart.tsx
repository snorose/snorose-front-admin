import { useId } from 'react';

import type { ExamReviewAdminStatusSummary } from '@/domains/Reviews/types';

import { ExamReviewAdminStatusInfoTooltip } from './ExamReviewAdminStatusInfoTooltip';

interface ExamReviewProgressChartProps {
  summary: ExamReviewAdminStatusSummary;
}

export function ExamReviewProgressChart({
  summary,
}: ExamReviewProgressChartProps) {
  const titleId = useId();
  const statusItems = [
    { label: '기간 내 업로드', value: summary.totalCount },
    { label: '확인 완료', value: summary.confirmedCount },
    { label: '미확인', value: summary.remainingCount },
  ];

  return (
    <section aria-labelledby={titleId} className='min-w-0'>
      <div className='flex items-center gap-1'>
        <h3 id={titleId} className='text-base font-semibold'>
          시험후기 확인 현황
        </h3>
        <ExamReviewAdminStatusInfoTooltip
          label='시험후기 확인 현황 설명'
          description='선택한 기간에 업로드된 시험후기의 확인 상태'
        />
      </div>

      <div className='bg-muted/30 mt-2 rounded-lg border p-4'>
        <dl className='grid grid-cols-3 gap-y-1 divide-x'>
          {statusItems.map(({ label, value }, index) => (
            <div
              key={label}
              className='row-span-2 grid min-w-0 grid-rows-subgrid px-3 first:pl-0 last:pr-0 sm:px-5'
            >
              <dt className='text-muted-foreground text-xs leading-5 break-keep sm:text-sm'>
                {label}
              </dt>
              <dd
                className={`flex flex-wrap items-baseline gap-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${index === 1 ? 'text-primary' : ''}`}
              >
                <span className='break-all'>
                  {value.toLocaleString('ko-KR')}
                </span>
                <span className='text-muted-foreground text-xs font-normal tracking-normal sm:text-sm'>
                  건
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className='mt-4 border-t pt-8 pb-4'>
          <div
            role='progressbar'
            aria-label='시험후기 확인 완료율'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.confirmedRate}
            className='relative mx-auto size-36'
          >
            <svg
              viewBox='0 0 144 144'
              className='size-full -rotate-90'
              aria-hidden='true'
            >
              <circle
                cx={72}
                cy={72}
                r={64}
                fill='none'
                strokeWidth={12}
                className='stroke-muted'
              />
              <circle
                cx={72}
                cy={72}
                r={64}
                fill='none'
                strokeWidth={12}
                pathLength={100}
                strokeDasharray={`${summary.confirmedRate} 100`}
                className='stroke-primary'
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-1'>
              <span className='text-2xl font-semibold tracking-tight tabular-nums'>
                {summary.confirmedRate}%
              </span>
              <span className='text-muted-foreground text-xs'>확인 완료율</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
