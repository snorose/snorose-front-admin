import { Badge } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import type { InquiryStatus } from '../types';

const STATUS_STYLE: Record<InquiryStatus, string> = {
  접수: 'bg-gray-100 text-gray-600 border-gray-300',
  진행중: 'bg-blue-100 text-blue-700 border-blue-300',
  진행완료: 'bg-green-100 text-green-700 border-green-300',
  보류: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
}

export default function InquiryStatusBadge({
  status,
}: InquiryStatusBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={cn('text-[11px] font-medium', STATUS_STYLE[status])}
    >
      {status}
    </Badge>
  );
}
