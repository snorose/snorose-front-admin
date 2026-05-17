import { Badge } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

interface PeriodStatusBadgeProps {
  startAt: string;
  endAt: string;
  className?: string;
}

const PERIOD_STATUS_VARIANTS = {
  IN_PROGRESS: {
    label: '진행중',
    variant: 'default' as const,
    className: 'bg-emerald-100 text-emerald-800',
  },
  SCHEDULED: {
    label: '예정',
    variant: 'secondary' as const,
    className: 'bg-amber-100 text-amber-800',
  },
  ENDED: {
    label: '종료',
    variant: 'default' as const,
    className: 'bg-slate-500 text-white',
  },
};

function parseDateTime(value: string): Date {
  return new Date(value.replace(' ', 'T'));
}

function getPeriodStatus(startAt: string, endAt: string) {
  const now = new Date();
  const startDate = parseDateTime(startAt);
  const endDate = parseDateTime(endAt);

  if (now < startDate) {
    return PERIOD_STATUS_VARIANTS.SCHEDULED;
  }

  if (now > endDate) {
    return PERIOD_STATUS_VARIANTS.ENDED;
  }

  return PERIOD_STATUS_VARIANTS.IN_PROGRESS;
}

export function PeriodStatusBadge({
  startAt,
  endAt,
  className,
}: PeriodStatusBadgeProps) {
  const status = getPeriodStatus(startAt, endAt);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Badge variant={status.variant} className={status.className}>
        {status.label}
      </Badge>
    </div>
  );
}
