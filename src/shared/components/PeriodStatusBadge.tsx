import { cn } from '@/shared/lib';
import {
  type PeriodStatus,
  getPeriodStatus,
} from '@/shared/utils/periodStatusUtils';

import { StatusBadge, type StatusBadgeTone } from './StatusBadge';

interface PeriodStatusBadgeProps {
  startAt: string;
  endAt: string;
  className?: string;
}

const PERIOD_STATUS_META: Record<
  PeriodStatus,
  { label: string; tone: StatusBadgeTone }
> = {
  IN_PROGRESS: {
    label: '진행중',
    tone: 'success',
  },
  SCHEDULED: {
    label: '예정',
    tone: 'warning',
  },
  ENDED: {
    label: '종료',
    tone: 'neutral',
  },
};

export function PeriodStatusBadge({
  startAt,
  endAt,
  className,
}: PeriodStatusBadgeProps) {
  const status = PERIOD_STATUS_META[getPeriodStatus(startAt, endAt)];

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
    </div>
  );
}
