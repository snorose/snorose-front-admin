import { DetailList } from '@/shared/components/DetailList';
import { ConfirmModal } from '@/shared/components/ui';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';
import { cn } from '@/shared/lib';
import type { AdminUserListItem } from '@/shared/types';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface PointAdjustmentConfirmModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  searchedMember: AdminUserListItem;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
}

export function PointAdjustmentConfirmModal({
  isOpen,
  isPending = false,
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
    <ConfirmModal
      isOpen={isOpen}
      title='포인트 지급/차감 확인'
      description='아래 내용으로 포인트를 적용하시겠습니까?'
      onConfirm={onConfirm}
      onClose={onClose}
      isPending={isPending}
      pendingText='적용 중'
    >
      <DetailList
        items={[
          ...CONFIRMATION_DATA,
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
