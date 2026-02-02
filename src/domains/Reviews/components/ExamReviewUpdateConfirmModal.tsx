import { ConfirmModal } from '@/shared/components/ui';

export type ExamReviewUpdateChange = {
  label: string;
  before: string;
  after: string;
};

interface ExamReviewUpdateConfirmModalProps {
  isOpen: boolean;
  changes: ExamReviewUpdateChange[];
  onClose: () => void;
  onConfirm: () => void;
}

export function ExamReviewUpdateConfirmModal({
  isOpen,
  changes,
  onClose,
  onConfirm,
}: ExamReviewUpdateConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title='시험 후기 수정'
      description='아래 항목이 수정됩니다. 저장하시겠습니까?'
      confirmText='저장'
      closeText='취소'
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className='overflow-hidden rounded-md border'>
        <div className='grid grid-cols-[140px_1fr_1fr] gap-3 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700'>
          <div>항목</div>
          <div>이전</div>
          <div>이후</div>
        </div>
        <div className='divide-y'>
          {changes.map((c) => (
            <div
              key={c.label}
              className='grid grid-cols-[140px_1fr_1fr] gap-3 px-3 py-2 text-sm'
            >
              <div className='text-gray-700'>{c.label}</div>
              <div className='break-words whitespace-pre-wrap text-gray-600'>
                {c.before || '-'}
              </div>
              <div className='break-words whitespace-pre-wrap text-gray-900'>
                {c.after || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConfirmModal>
  );
}
