import { StatusBadge, type StatusBadgeTone } from '@/shared/components';
import { cn } from '@/shared/lib';

import type { ExamReviewProcessStatus } from '@/domains/Reviews/types';
import { getExamReviewProcessStatusLabel } from '@/domains/Reviews/utils';

interface ExamReviewProcessStatusBadgeProps {
  status: ExamReviewProcessStatus;
  className?: string;
}

const PROCESS_STATUS_BADGE_TONES: Record<
  ExamReviewProcessStatus,
  StatusBadgeTone
> = {
  VISIBLE: 'success',
  USER_DELETED: 'danger',
  ADMIN_DELETED: 'danger',
  ADMIN_HIDDEN: 'warning',
  AUTO_HIDDEN: 'warning',
  SANCTIONED: 'accent',
  DESANCTIONED: 'success',
};

export function ExamReviewProcessStatusBadge({
  status,
  className,
}: ExamReviewProcessStatusBadgeProps) {
  const label = getExamReviewProcessStatusLabel(status);

  return (
    <div className={cn('flex items-center', className)} title={label}>
      <StatusBadge tone={PROCESS_STATUS_BADGE_TONES[status]}>
        {label}
      </StatusBadge>
    </div>
  );
}
