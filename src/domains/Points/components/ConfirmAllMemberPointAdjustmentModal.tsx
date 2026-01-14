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

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface ConfirmPointAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
}

export default function ConfirmPointAdjustmentModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCategory,
  difference,
  memo,
}: ConfirmPointAdjustmentModalProps) {
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
            <span className='w-24 text-sm font-semibold'>포인트 유형:</span>
            <span className='text-sm'>
              {selectedCategory
                ? (POINT_CATEGORY_OPTIONS.find(
                    (option) => option.value === selectedCategory
                  )?.label ?? '')
                : ''}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-24 text-sm font-semibold'>포인트:</span>
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
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>메모:</span>
              <span className='text-sm'>{memo}</span>
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
