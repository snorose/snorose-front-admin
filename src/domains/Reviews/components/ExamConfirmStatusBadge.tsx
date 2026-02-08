import { Badge } from '@/shared/components/ui';
import { EXAM_CONFIRM_STATUS } from '@/shared/constants';

interface ExamConfirmStatusBadgeProps {
  status: string;
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
};

export function ExamConfirmStatusBadge({
  status,
}: ExamConfirmStatusBadgeProps) {
  const option = EXAM_CONFIRM_STATUS.find((s) => s.code === status);
  const label = option?.label ?? '';

  const variantInfo =
    EXAM_CONFIRMED_STATUS_VARIANTS[
      status as keyof typeof EXAM_CONFIRMED_STATUS_VARIANTS
    ] ?? EXAM_CONFIRMED_STATUS_VARIANTS.UNCONFIRMED;

  return (
    <div className='flex items-center'>
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
