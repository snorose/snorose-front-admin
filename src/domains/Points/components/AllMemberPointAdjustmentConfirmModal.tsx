import { ConfirmModal } from '@/shared/components/ui';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';
import { cn } from '@/shared/lib';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface AllMemberPointAdjustmentConfirmModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
}

export function AllMemberPointAdjustmentConfirmModal({
  isOpen,
  isPending = false,
  onClose,
  onConfirm,
  selectedCategory,
  difference,
  memo,
}: AllMemberPointAdjustmentConfirmModalProps) {
  const isPositiveDifference = Number(difference) > 0;

  return (
    <ConfirmModal
      isOpen={isOpen}
      title='정회원 전체 포인트 지급/차감 확인'
      description='아래 내용으로 포인트를 적용하시겠습니까?'
      onConfirm={onConfirm}
      onClose={onClose}
      isPending={isPending}
      pendingText='적용 중'
    >
      <div className='flex min-w-0 flex-col gap-3 wrap-anywhere'>
        <div className='flex min-w-0 items-start gap-2'>
          <span className='shrink-0 text-sm font-semibold text-gray-700'>
            포인트 유형:
          </span>
          <span className='text-sm'>
            {selectedCategory
              ? (POINT_CATEGORY_OPTIONS.find(
                  (option) => option.value === selectedCategory
                )?.label ?? '')
              : ''}
          </span>
        </div>
        <div className='flex min-w-0 items-start gap-2'>
          <span className='shrink-0 text-sm font-semibold text-gray-700'>
            포인트 지급/차감량:
          </span>
          <span
            className={cn(
              'text-sm',
              isPositiveDifference ? 'text-blue-600' : 'text-red-600'
            )}
          >
            {isPositiveDifference ? '+' : ''}
            {difference}
          </span>
        </div>
        {memo && (
          <div className='flex items-start gap-2'>
            <span className='flex-shrink-0 text-sm font-semibold text-gray-700'>
              메모:
            </span>
            <span className='min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memo}
            </span>
          </div>
        )}
      </div>
    </ConfirmModal>
  );
}
