import { DetailList } from '@/shared/components/DetailList';
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
      <DetailList
        items={[
          {
            label: '포인트 유형',
            value: selectedCategory
              ? (POINT_CATEGORY_OPTIONS.find(
                  (option) => option.value === selectedCategory
                )?.label ?? '')
              : '',
          },
          {
            label: '포인트 지급/차감량',
            value: (
              <span
                className={cn(
                  isPositiveDifference ? 'text-blue-600' : 'text-red-600'
                )}
              >
                {isPositiveDifference ? '+' : ''}
                {difference}
              </span>
            ),
          },
          ...(memo ? [{ label: '메모', value: memo }] : []),
        ]}
      />
    </ConfirmModal>
  );
}
