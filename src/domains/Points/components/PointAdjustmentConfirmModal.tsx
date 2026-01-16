import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import { cn } from '@/utils';
import { POINT_CATEGORY_OPTIONS } from '@/constants';
import type { MemberInfo } from '@/types';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface PointAdjustmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  searchedMember: MemberInfo;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
}

export default function PointAdjustmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  searchedMember,
  selectedCategory,
  difference,
  memo,
}: PointAdjustmentConfirmModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>포인트 지급/차감 확인</DialogTitle>
          <DialogDescription>
            아래 내용으로 포인트를 적용하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3 py-4'>
          {CONFIRMATION_DATA.map((data) => (
            <div className='flex items-center gap-2' key={data.label}>
              <span className='text-sm font-semibold'>{data.label}:</span>
              <span className='text-sm'>{data.value}</span>
            </div>
          ))}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold'>포인트 지급/차감량:</span>
            <span
              className={cn(
                'text-sm',
                Number(difference) > 0 ? 'text-blue-600' : 'text-red-600'
              )}
            >
              {Number(difference) > 0 ? '+' : ''}
              {difference}
            </span>
          </div>
          {memo && (
            <div className='flex items-start gap-2'>
              <span className='flex-shrink-0 text-sm font-semibold'>메모:</span>
              <span className='text-sm break-keep'>{memo}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            취소
          </Button>
          <Button type='button' onClick={onConfirm}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
