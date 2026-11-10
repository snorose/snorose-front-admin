import { DescriptionListModal } from '@/shared/components';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface AllMemberPointAdjustmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
}

export function AllMemberPointAdjustmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCategory,
  difference,
  memo,
}: AllMemberPointAdjustmentConfirmModalProps) {
  const isPositiveDifference = Number(difference) > 0;

  return (
    <DescriptionListModal
      open={isOpen}
      onClose={onClose}
      title='정회원 전체 포인트 지급/차감 확인'
      description='아래 내용으로 포인트를 적용하시겠습니까?'
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
          label: '포인트 증감량',
          value: (
            <span
              className={
                isPositiveDifference ? 'text-blue-600' : 'text-red-600'
              }
            >
              {isPositiveDifference ? '+' : ''}
              {difference}
            </span>
          ),
        },
        ...(memo ? [{ label: '메모', value: memo }] : []),
      ]}
      action={{
        label: isPositiveDifference ? '지급하기' : '차감하기',
        onClick: onConfirm,
      }}
    />
  );
}
