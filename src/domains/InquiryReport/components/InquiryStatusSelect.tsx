import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { ConfirmModal, Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import type { InquiryStatus } from '@/shared/types';

import { getInquiryStatusBadgeMeta } from '@/domains/InquiryReport/constants/inquiryReportLabels';

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

const STATUS_OPTIONS = [
  'PENDING',
  'COMPLETED',
  // TODO: 백엔드 HOLD 상태 지원 후 주석 해제
  // 'HOLD',
] as const satisfies ReadonlyArray<InquiryStatus>;

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
  const statusBadge = getInquiryStatusBadgeMeta(status);

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
            'group h-8 rounded-full border-transparent bg-transparent px-1 py-0 shadow-none transition hover:bg-transparent focus-visible:ring-2 focus-visible:ring-slate-200 [&>svg]:hidden',
            className
          )}
        >
          <div className='flex items-center gap-1.5'>
            <StatusBadge tone={statusBadge.tone}>
              {statusBadge.label}
            </StatusBadge>
            <ChevronDown className='h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100' />
          </div>
        </Select.Trigger>
        <Select.Content
          align='center'
          onClick={(event) => event.stopPropagation()}
        >
          {STATUS_OPTIONS.map((option) => {
            const optionBadge = getInquiryStatusBadgeMeta(option);

            return (
              <Select.Item
                key={option}
                value={option}
                textValue={optionBadge.label}
              >
                <StatusBadge tone={optionBadge.tone}>
                  {optionBadge.label}
                </StatusBadge>
              </Select.Item>
            );
          })}
        </Select.Content>
      </Select>

      <ConfirmModal
        isOpen={pendingStatus !== null}
        title='상태 변경'
        description={
          pendingStatus
            ? `"${title}" 상태를 ${getInquiryStatusBadgeMeta(pendingStatus).label}(으)로 변경할까요?`
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
