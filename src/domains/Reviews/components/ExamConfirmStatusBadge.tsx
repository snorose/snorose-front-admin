import { StatusBadge, type StatusBadgeTone } from '@/shared/components';
import { EXAM_CONFIRM_STATUS } from '@/shared/constants';
import { cn } from '@/shared/lib';

interface ExamConfirmStatusBadgeProps {
  status: string;
  className?: string;
}

const EXAM_CONFIRM_STATUS_TONES: Record<string, StatusBadgeTone> = {
  CONFIRMED: 'info',
  UNCONFIRMED: 'neutral',
  NEED_DISCUSS: 'warning',
  NEED_ACTION: 'danger',
  DELETED: 'danger',
};

export function ExamConfirmStatusBadge({
  status,
  className,
}: ExamConfirmStatusBadgeProps) {
  const option = EXAM_CONFIRM_STATUS.find((s) => s.code === status);
  const label = option?.label ?? '알 수 없음';
  const tone = EXAM_CONFIRM_STATUS_TONES[status] ?? 'neutral';

  return (
    <div className={cn('flex items-center', className)} title={label}>
      <StatusBadge tone={tone}>{label}</StatusBadge>
    </div>
  );
}
