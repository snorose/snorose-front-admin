import { Badge } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import type { ExamReviewProcessStatus } from '@/domains/Reviews/types';
import { getExamReviewProcessStatusLabel } from '@/domains/Reviews/utils';

interface ExamReviewProcessStatusBadgeProps {
  status: ExamReviewProcessStatus;
  className?: string;
}

const PROCESS_STATUS_BADGE_CLASS_NAMES: Record<
  ExamReviewProcessStatus,
  string
> = {
  VISIBLE: 'bg-gray-100 text-gray-700',
  USER_DELETED: 'bg-red-50 text-red-700',
  ADMIN_DELETED: 'bg-red-50 text-red-700',
  ADMIN_HIDDEN: 'bg-amber-50 text-amber-700',
  AUTO_HIDDEN: 'bg-amber-50 text-amber-700',
  SANCTIONED: 'bg-violet-50 text-violet-700',
  DESANCTIONED: 'bg-emerald-50 text-emerald-700',
};

export function ExamReviewProcessStatusBadge({
  status,
  className,
}: ExamReviewProcessStatusBadgeProps) {
  const label = getExamReviewProcessStatusLabel(status);

  return (
    <Badge
      variant='default'
      className={cn(PROCESS_STATUS_BADGE_CLASS_NAMES[status], className)}
      title={label}
    >
      {label}
    </Badge>
  );
}
