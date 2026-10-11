import { StatusBadge } from '@/shared/components';
import { EXAM_REVIEW_PROCESS_STATUS } from '@/shared/constants';
import { cn } from '@/shared/lib';

import type { ExamReviewProcessStatus } from '@/domains/Reviews/types';

interface ExamReviewProcessStatusBadgeProps {
  status: ExamReviewProcessStatus;
  className?: string;
}

export function ExamReviewProcessStatusBadge({
  status,
  className,
}: ExamReviewProcessStatusBadgeProps) {
  const option = EXAM_REVIEW_PROCESS_STATUS.find(
    (option) => option.code === status
  );
  const label = option?.label ?? status;

  return (
    <div className={cn('flex items-center', className)} title={label}>
      <StatusBadge tone={option?.tone ?? 'neutral'}>{label}</StatusBadge>
    </div>
  );
}
