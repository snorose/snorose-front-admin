import { toast } from 'sonner';

import { Button } from '@/shared/components/ui';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface PointActionButtonsProps {
  encryptedUserId: string | null;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
  onReset: () => void;
  onApply: () => void;
}

export function PointActionButtons({
  encryptedUserId,
  selectedCategory,
  difference,
  memo,
  onReset,
  onApply,
}: PointActionButtonsProps) {
  const handleApplyClick = () => {
    if (!encryptedUserId?.trim() || !selectedCategory || !difference || !memo) {
      toast.info('모든 필수 항목을 입력해주세요.');
      return;
    }

    const numDifference = Number(difference);
    if (isNaN(numDifference) || numDifference === 0) {
      toast.info('유효한 포인트 지급/차감량을 입력해주세요.');
      return;
    }

    onApply();
  };

  return (
    <div className='flex justify-end gap-2'>
      <Button
        type='button'
        size='lg'
        variant='outline'
        onClick={onReset}
        className='w-32'
      >
        초기화
      </Button>
      <Button
        type='button'
        size='lg'
        variant='default'
        className='w-32'
        onClick={handleApplyClick}
      >
        적용
      </Button>
    </div>
  );
}
