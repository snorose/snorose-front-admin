import { CheckCircle2Icon, Clock3Icon, FilesIcon } from 'lucide-react';

import { Card } from '@/shared/components/ui';

import type { ExamReviewAdminStatusSummary } from '@/domains/Reviews/types';
import { getExamReviewCompletionRate } from '@/domains/Reviews/utils';

interface ExamReviewProgressChartProps {
  summary: ExamReviewAdminStatusSummary;
}

const CHART_RADIUS = 54;
const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;

export function ExamReviewProgressChart({
  summary,
}: ExamReviewProgressChartProps) {
  const completionRate = getExamReviewCompletionRate(
    summary.confirmedCount,
    summary.totalCount
  );
  const chartOffset = CHART_CIRCUMFERENCE * (1 - completionRate / 100);

  const statusItems = [
    {
      label: '총 시험후기',
      value: summary.totalCount,
      icon: FilesIcon,
      className: 'text-slate-600',
    },
    {
      label: '확인 완료',
      value: summary.confirmedCount,
      icon: CheckCircle2Icon,
      className: 'text-primary',
    },
    {
      label: '남은 후기',
      value: summary.unconfirmedCount,
      icon: Clock3Icon,
      className: 'text-amber-600',
    },
  ];

  return (
    <Card className='h-[392px] bg-white'>
      <Card.Header className='px-6 pt-6'>
        <Card.Title>확인 진행률</Card.Title>
        <Card.Description>
          선택한 기간에 등록된 시험후기 기준입니다.
        </Card.Description>
      </Card.Header>

      <Card.Content className='flex flex-col items-center gap-6 md:flex-row md:items-stretch'>
        <div
          role='progressbar'
          aria-label='시험후기 확인 완료율'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionRate}
          className='relative size-44 shrink-0'
        >
          <svg
            aria-hidden='true'
            className='size-full -rotate-90'
            viewBox='0 0 128 128'
          >
            <circle
              className='stroke-muted'
              cx='64'
              cy='64'
              r={CHART_RADIUS}
              fill='none'
              strokeWidth='12'
            />
            <circle
              className='stroke-primary transition-[stroke-dashoffset] duration-500'
              cx='64'
              cy='64'
              r={CHART_RADIUS}
              fill='none'
              strokeWidth='12'
              strokeLinecap='round'
              strokeDasharray={CHART_CIRCUMFERENCE}
              strokeDashoffset={chartOffset}
            />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <strong className='text-3xl font-bold'>{completionRate}%</strong>
            <span className='text-muted-foreground text-xs'>확인 완료</span>
          </div>
        </div>

        <dl className='flex w-full flex-1 flex-col justify-center divide-y'>
          {statusItems.map(({ label, value, icon: Icon, className }) => (
            <div
              key={label}
              className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'
            >
              <dt className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Icon className={className} />
                {label}
              </dt>
              <dd className='text-lg font-semibold'>{value}건</dd>
            </div>
          ))}
        </dl>
      </Card.Content>
    </Card>
  );
}
