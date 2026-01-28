import { useState } from 'react';
import { Button, Select } from '@/shared/components/ui';
import { DEGRADE_REASON_LIST } from '@/shared/constants';

const SELECT_CONTENT_STYLE =
  'text-[10px] max-h-[200px] overflow-y-auto bg-blue-50 [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-highlighted]]:bg-blue-100/50 [&_[data-state=checked]]:bg-blue-100';

// 시험후기 패널 - 강등 입력 컴포넌트
export default function ExamDegradePanel() {
  const [warningCount, setWarningCount] = useState(1);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [discussionNotes, setDiscussionNotes] = useState('');

  const isEtcSelected = selectedReason === 'ETC';
  const isFormValid =
    selectedReason && (isEtcSelected ? discussionNotes : true);

  return (
    <div className='flex w-full flex-col gap-2 px-4 py-2'>
      <div className='w-full max-w-[600px] overflow-auto'>
        <p className='mb-3 px-1 py-1 text-[14px] font-semibold'># 유저 강등</p>
        <div>
          <p className='w-full py-1 text-xs font-semibold'>강등 사유</p>
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <Select.Trigger className='w-full'>
              <Select.Value placeholder='강등 사유를 선택해주세요.' />
            </Select.Trigger>
            <Select.Content className={SELECT_CONTENT_STYLE}>
              {DEGRADE_REASON_LIST.map((reason) => (
                <Select.Item key={reason.code} value={reason.code}>
                  {reason.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {isEtcSelected && (
            <>
              <p className='mt-2 w-full py-1 text-xs font-semibold'>
                강등 기간(개월)
              </p>
              <input
                type='number'
                min={1}
                className='w-20 rounded-md border border-gray-300 px-2 py-1 text-sm font-medium'
                value={Math.max(
                  Number.isNaN(Number(warningCount)) ? 1 : Number(warningCount),
                  1
                )}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setWarningCount(isNaN(val) || val < 1 ? 1 : val);
                }}
              />
              <textarea
                placeholder='유저 강등 사유를 입력해주세요.'
                value={discussionNotes}
                onChange={(e) => {
                  setDiscussionNotes(e.target.value);
                  // 자동 리사이즈
                  const textArea = e.target as HTMLTextAreaElement;
                  textArea.style.height = 'auto';
                  textArea.style.height = textArea.scrollHeight + 'px';
                }}
                className='mt-2 min-h-[100px] w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none'
                rows={1}
                style={{ overflow: 'hidden' }}
              />
            </>
          )}
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button
            variant='secondary'
            size='sm'
            className='h-6 w-20 text-sm'
            disabled={!isFormValid}
            onClick={() => {
              setSelectedReason('');
              setDiscussionNotes('');
            }}
          >
            취소
          </Button>
          <Button
            variant='default'
            size='sm'
            className='h-6 w-20 bg-gray-700 text-sm'
            disabled={!isFormValid}
          >
            강등
          </Button>
        </div>
      </div>
    </div>
  );
}
