import { DescriptionListModal } from '@/shared/components';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';
import type { AdminUserListItem } from '@/shared/types';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface PointAdjustmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  searchedMember: AdminUserListItem;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
}

export function PointAdjustmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  searchedMember,
  selectedCategory,
  difference,
  memo,
}: PointAdjustmentConfirmModalProps) {
  const isPositiveDifference = Number(difference) > 0;

  const CONFIRMATION_DATA = [
    { label: '아이디', value: searchedMember?.loginId },
    { label: '이름', value: searchedMember.userName },
    { label: '학과', value: searchedMember.major },
    { label: '학번', value: searchedMember.studentNumber },
    {
      label: '포인트 유형',
      value: selectedCategory
        ? (POINT_CATEGORY_OPTIONS.find(
            (option) => option.value === selectedCategory
          )?.label ?? '')
        : '',
    },
  ];

  return (
    <DescriptionListModal
      open={isOpen}
      onClose={onClose}
      title='포인트 지급/차감 확인'
      description='아래 내용으로 포인트를 적용하시겠습니까?'
      items={[
        ...CONFIRMATION_DATA,
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
        variant: isPositiveDifference ? 'default' : 'destructive',
        onClick: onConfirm,
      }}
    />
  );
}
