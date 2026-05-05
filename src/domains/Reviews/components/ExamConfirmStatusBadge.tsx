import { Badge } from '@/shared/components/ui';
import { EXAM_CONFIRM_STATUS } from '@/shared/constants';
import { cn } from '@/shared/lib';

interface ExamConfirmStatusBadgeProps {
  status: string;
  className?: string;
}

const EXAM_CONFIRMED_STATUS_VARIANTS = {
  CONFIRMED: {
    variant: 'default' as const,
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  UNCONFIRMED: {
    variant: 'secondary' as const,
    className: undefined,
  },
  NEED_DISCUSS: {
    variant: 'default' as const,
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  NEED_ACTION: {
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
  DELETED: {
    variant: 'outline' as const,
    className: 'text-gray-500 dark:text-gray-400',
  },
};

export function ExamConfirmStatusBadge({
  status,
  className,
}: ExamConfirmStatusBadgeProps) {
  const option = EXAM_CONFIRM_STATUS.find((s) => s.code === status);
  const label = option?.label ?? '';

  const variantInfo =
    EXAM_CONFIRMED_STATUS_VARIANTS[
      status as keyof typeof EXAM_CONFIRMED_STATUS_VARIANTS
    ] ?? EXAM_CONFIRMED_STATUS_VARIANTS.UNCONFIRMED;

  return (
    <div className={cn('flex items-center', className)}>
      <Badge
        variant={variantInfo.variant}
        className={variantInfo.className}
        title={label}
      >
        {label}
      </Badge>
    </div>
  );
}
