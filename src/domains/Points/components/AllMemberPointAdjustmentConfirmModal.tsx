import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import { cn } from '@/shared/lib';
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

export default function AllMemberPointAdjustmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCategory,
  difference,
  memo,
}: AllMemberPointAdjustmentConfirmModalProps) {
  const isPositiveDifference = Number(difference) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정회원 전체 포인트 지급/차감 확인</DialogTitle>
          <DialogDescription>
            아래 내용으로 포인트를 적용하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3 py-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold'>포인트 유형:</span>
            <span className='text-sm'>
              {selectedCategory
                ? (POINT_CATEGORY_OPTIONS.find(
                    (option) => option.value === selectedCategory
                  )?.label ?? '')
                : ''}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold'>포인트 지급/차감량:</span>
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
