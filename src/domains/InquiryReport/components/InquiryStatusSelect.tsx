import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { ConfirmModal, Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import type { InquiryStatus } from '@/shared/types';

type InquiryStatusSelectProps = {
  ariaLabel?: string;
  className?: string;
  inquiryId: number;
  status: InquiryStatus;
  title: string;
  onStatusChange: (
    inquiryId: number,
    status: InquiryStatus
  ) => void | Promise<void>;
};

const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '답변 전',
  COMPLETED: '답변 완료',
  HOLD: '보류',
};

const STATUS_TRIGGER_CLASS_NAMES: Record<InquiryStatus, string> = {
  PENDING:
    'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100',
  COMPLETED:
    'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100',
  HOLD: 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200 hover:bg-amber-100',
};

const STATUS_OPTIONS = [
  { label: '답변 전', value: 'PENDING' },
  { label: '답변 완료', value: 'COMPLETED' },
  // TODO: 백엔드 HOLD 상태 지원 후 주석 해제
  // { label: '보류', value: 'HOLD' },
] as const;

export default function InquiryStatusSelect({
  ariaLabel = '상태 변경',
  className,
  inquiryId,
  status,
  title,
  onStatusChange,
}: InquiryStatusSelectProps) {
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(
    null
  );
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;

    try {
      setIsStatusUpdating(true);
      await onStatusChange(inquiryId, pendingStatus);
      setPendingStatus(null);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <>
      <Select
        value={status}
        onValueChange={(value) => {
          const nextStatus = value as InquiryStatus;
          if (nextStatus === status) return;
          setPendingStatus(nextStatus);
        }}
      >
        <Select.Trigger
          onClick={(event) => event.stopPropagation()}
          aria-label={ariaLabel}
          className={cn(
            'group h-8 rounded-full border px-3 py-1 text-[11px] font-bold shadow-xs transition focus-visible:ring-2 focus-visible:ring-slate-200 [&>svg]:hidden',
            STATUS_TRIGGER_CLASS_NAMES[status],
            className
          )}
        >
          <div className='flex items-center gap-1.5'>
            <span>{INQUIRY_STATUS_LABELS[status]}</span>
            <ChevronDown className='h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100' />
          </div>
        </Select.Trigger>
        <Select.Content
          align='center'
          onClick={(event) => event.stopPropagation()}
        >
          {STATUS_OPTIONS.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      <ConfirmModal
        isOpen={pendingStatus !== null}
        title='상태 변경'
        description={
          pendingStatus
            ? `"${title}" 상태를 ${INQUIRY_STATUS_LABELS[pendingStatus]}(으)로 변경할까요?`
            : undefined
        }
        confirmText={isStatusUpdating ? '변경 중...' : '변경'}
        confirmButtonClassName='bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-slate-300'
        closeText='취소'
        onClose={() => {
          if (!isStatusUpdating) setPendingStatus(null);
        }}
        onConfirm={() => {
          void handleConfirmStatusChange();
        }}
      />
    </>
  );
}
