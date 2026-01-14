import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { Button, Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { PageHeader } from '@/components';
import { POINT_CATEGORY_OPTIONS } from '@/constants';
import { postAllMemberPointAPI } from '@/apis/points';
import { getErrorMessage } from '@/utils';
import { toast } from 'sonner';
import { PointDetailSection } from '@/domains/Points';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

export default function AdjustAllMemberPointPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof POINT_CATEGORY_OPTIONS)[number]['value'] | ''
  >('');
  const [difference, setDifference] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  const handleResetButtonClick = () => {
    setSelectedCategory('');
    setDifference('');
    setMemo('');
  };

  const handleApplyButtonClick = async () => {
    if (!selectedCategory || !difference || !memo) {
      toast.info('모든 필수 항목을 입력해주세요.');
      return;
    }

    const numDifference = Number(difference);

    if (isNaN(numDifference) || numDifference === 0) {
      toast.info('유효한 포인트 지급/차감량을 입력해주세요.');
      return;
    }

    try {
      await postAllMemberPointAPI({
        category: selectedCategory as PointCategoryValue,
        memo: memo,
        difference: numDifference,
      });

      toast.success('포인트 지급/차감이 완료되었어요.');
      handleResetButtonClick();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '포인트 지급/차감에 실패했습니다.'));
    }
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='정회원 전체 포인트 지급/차감'
        description='모든 정회원에게 포인트를 지급/차감할 수 있어요.'
      />

      <Alert>
        <Megaphone />
        <AlertTitle>안내 사항</AlertTitle>
        <AlertDescription>
          <ul className='list-inside list-disc text-sm'>
            <li>포인트 카테고리, 메모, 지급/차감량을 설정할 수 있어요.</li>
            <li>포인트 지급/차감은 즉시 적용되므로 신중히 진행해 주세요.</li>
          </ul>
        </AlertDescription>
      </Alert>

      <PointDetailSection
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        difference={difference}
        onDifferenceChange={setDifference}
        memo={memo}
        onMemoChange={setMemo}
      />

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          size='lg'
          variant='outline'
          onClick={handleResetButtonClick}
          className='text-md h-10 w-32 cursor-pointer font-bold text-red-400 hover:text-red-400 active:text-red-600'
        >
          초기화
        </Button>
        <Button
          type='submit'
          size='lg'
          variant='outline'
          onClick={handleApplyButtonClick}
          className='text-md h-10 w-32 cursor-pointer font-bold'
        >
          적용
        </Button>
      </div>
    </div>
  );
}
