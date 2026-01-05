import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import { POINT_CATEGORY } from '@/constants';
import type { MemberInfo } from '@/types';

interface ConfirmPointAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  searchedMember: MemberInfo;
  selectedCategory: keyof typeof POINT_CATEGORY;
  difference: string;
  memo: string;
}

export default function ConfirmPointAdjustmentModal({
  isOpen,
  onClose,
  onConfirm,
  searchedMember,
  selectedCategory,
  difference,
  memo,
}: ConfirmPointAdjustmentModalProps) {
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
          <div className='flex items-center gap-2'>
            <span className='w-24 text-sm font-semibold'>아이디:</span>
            <span className='text-sm'>{searchedMember?.loginId}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-24 text-sm font-semibold'>이름:</span>
            <span className='text-sm'>{searchedMember?.userName}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-24 text-sm font-semibold'>학과:</span>
            <span className='text-sm'>{searchedMember?.major}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-24 text-sm font-semibold'>학번:</span>
            <span className='text-sm'>{searchedMember?.studentNumber}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-24 text-sm font-semibold'>포인트 유형:</span>
            <span className='text-sm'>
              {selectedCategory && POINT_CATEGORY[selectedCategory]}
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
