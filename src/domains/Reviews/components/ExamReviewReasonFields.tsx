import { useId } from 'react';

import { Textarea } from '@/shared/components/ui';

type ExamReviewReasonFieldsProps = {
  action: '삭제' | '복구';
  existingMemo: string | null;
  reason: string;
  disabled: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
};

export function ExamReviewReasonFields({
  action,
  existingMemo,
  reason,
  disabled,
  onReasonChange,
  onConfirm,
}: ExamReviewReasonFieldsProps) {
  const id = useId();
  const memoId = `${id}-memo`;
  const reasonId = `${id}-reason`;
  const helpId = `${id}-help`;

  return (
    <>
      <div className='flex flex-col gap-2'>
        <label htmlFor={memoId} className='text-sm font-medium text-gray-700'>
          기존 메모
        </label>
        <Textarea
          id={memoId}
          value={existingMemo ?? ''}
          placeholder='기존 메모가 없습니다.'
          className='bg-muted min-h-[96px] resize-none'
          readOnly
        />
      </div>
      <div className='flex flex-col gap-2'>
        <label htmlFor={reasonId} className='text-sm font-medium text-gray-700'>
          {action} 사유
        </label>
        <Textarea
          id={reasonId}
          value={reason}
          aria-describedby={helpId}
          onChange={(event) => onReasonChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.nativeEvent.isComposing &&
              (event.metaKey || event.ctrlKey) &&
              reason.trim() &&
              !disabled
            ) {
              event.preventDefault();
              onConfirm();
            }
          }}
          placeholder={`${action} 사유를 입력해주세요.`}
          className='min-h-[120px] resize-none'
          disabled={disabled}
        />
        <p id={helpId} className='text-sm text-gray-500'>
          기존 메모 아래에 [{action} 사유]로 저장됩니다.
        </p>
      </div>
    </>
  );
}
