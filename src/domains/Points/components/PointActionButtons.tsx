import { Button } from '@/components/ui';
import { toast } from 'sonner';
import { POINT_CATEGORY_OPTIONS } from '@/constants';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface PointActionButtonsProps {
  userId: number | null;
  selectedCategory: PointCategoryValue | '';
  difference: string;
  memo: string;
  onReset: () => void;
  onApply: () => void;
}

export default function PointActionButtons({
  userId,
  selectedCategory,
  difference,
  memo,
  onReset,
  onApply,
}: PointActionButtonsProps) {
  const handleApplyClick = () => {
    if (!userId || !selectedCategory || !difference || !memo) {
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
        className='text-md h-10 w-32 cursor-pointer font-bold text-red-400 hover:text-red-400 active:text-red-600'
      >
        초기화
      </Button>
      <Button
        type='button'
        size='lg'
        variant='outline'
        className='text-md h-10 w-32 cursor-pointer font-bold'
        onClick={handleApplyClick}
      >
        적용
      </Button>
    </div>
  );
}
