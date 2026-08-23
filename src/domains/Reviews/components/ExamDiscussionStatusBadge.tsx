import { StatusBadge } from '@/shared/components';
import { cn } from '@/shared/lib';

interface ExamDiscussionStatusBadgeProps {
  isDiscussed: boolean;
  className?: string;
}

export function ExamDiscussionStatusBadge({
  isDiscussed,
  className,
}: ExamDiscussionStatusBadgeProps) {
  const label = isDiscussed ? '논의 있음' : '논의 없음';
  const tone = isDiscussed ? 'info' : 'neutral';

  return (
    <div className={cn('flex items-center', className)} title={label}>
      <StatusBadge tone={tone}>{label}</StatusBadge>
    </div>
  );
}
