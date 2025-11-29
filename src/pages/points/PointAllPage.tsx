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
import { POINT_CATEGORY } from '@/constants';

export default function PointAllPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof POINT_CATEGORY | ''
  >('');
  const [difference, setDifference] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  const handleResetButtonClick = () => {
    setSelectedCategory('');
    setDifference('');
    setMemo('');
  };

  const handleApplyButtonClick = () => {
    try {
      if (!selectedCategory || !difference || !memo) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      const numDifference = Number(difference);

      if (isNaN(numDifference) || numDifference === 0) {
        alert('유효한 포인트 지급/차감량을 입력해주세요.');
        return;
      }
    } catch {
      alert('포인트 지급/차감에 실패했습니다.');
    }
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='정회원 전체 포인트 지급/차감'
        description='모든 정회원에게 포인트를 지급/차감하는 기능이니, 신중히 진행해 주세요.'
      />

      <Alert>
        <Megaphone />
        <AlertTitle>안내 사항</AlertTitle>
        <AlertDescription>
          <ul className='list-inside list-disc text-sm'>
            <li>포인트 카테고리, 메모, 지급량을 설정할 수 있어요.</li>
            <li>
              포인트가 자동 지급되지 않으니, 직접 지급/차감을 진행해 주세요.
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트 상세</h3>
        <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='category' required>
              포인트 유형
            </Label>
            <Select
              onValueChange={(value: keyof typeof POINT_CATEGORY | '') =>
                setSelectedCategory(value)
              }
              value={selectedCategory}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='포인트 유형을 선택해주세요' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(POINT_CATEGORY).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
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
              placeholder='이벤트 당첨 포인트 지급, 시험 후기 오류 제보 등'
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
