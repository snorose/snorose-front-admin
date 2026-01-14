import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import { PageHeader } from '@/components';
import { POINT_CATEGORY_OPTIONS } from '@/constants';
import { postAllMemberPointAPI } from '@/apis/points';
import { getErrorMessage } from '@/utils';
import { toast } from 'sonner';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

export default function AdjustAllMemberPointPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof POINT_CATEGORY_OPTIONS)[number]['value'] | ''
  >('POINT_REWARD_REPORT_GENERAL');
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

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트 상세</h3>
        <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4 pb-5'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='category' required>
              포인트 유형
            </Label>
            <Select
              onValueChange={(value: PointCategoryValue | '') =>
                setSelectedCategory(value)
              }
              value={selectedCategory ?? undefined}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='포인트 유형을 선택해주세요' />
              </SelectTrigger>
              <SelectContent>
                {POINT_CATEGORY_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='difference' required>
              포인트 지급/차감량
            </Label>
            <Input
              type='number'
              id='difference'
              value={difference}
              placeholder='양수 또는 음수만 입력 가능 (예: 20, -50)'
              onChange={(e) => setDifference(e.target.value)}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='memo' required>
              메모
            </Label>
            <Input
              type='text'
              id='memo'
              placeholder='스노로즈 후원금 모금 이벤트 보상 등'
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>
      </article>

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
