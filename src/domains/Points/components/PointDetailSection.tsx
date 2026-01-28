import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/components/ui';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';
import { useEffect } from 'react';

type PointCategoryValue = (typeof POINT_CATEGORY_OPTIONS)[number]['value'];

interface PointDetailSectionProps {
  selectedCategory: PointCategoryValue | '';
  onCategoryChange: (category: PointCategoryValue | '') => void;
  difference: string;
  onDifferenceChange: (value: string) => void;
  memo: string;
  onMemoChange: (value: string) => void;
}

export default function PointDetailSection({
  selectedCategory,
  onCategoryChange,
  difference,
  onDifferenceChange,
  memo,
  onMemoChange,
}: PointDetailSectionProps) {
  const selectedOption = selectedCategory
    ? POINT_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)
    : undefined;

  const isAutoFilled = selectedOption?.points !== null;

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    const selectedOption = POINT_CATEGORY_OPTIONS.find(
      (option) => option.value === selectedCategory
    );

    if (selectedOption && selectedOption.points !== null) {
      const newValue = selectedOption.points.toString();

      if (difference !== newValue) {
        onDifferenceChange(newValue);
      }
    } else {
      if (difference) {
        onDifferenceChange('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  return (
    <article className='flex flex-col gap-1'>
      <h3 className='text-lg font-bold'>지급할 포인트 상세</h3>
      <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4 pb-5'>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='category' required>
            포인트 유형
          </Label>
          <Select
            key={selectedCategory || 'empty'}
            onValueChange={(selectedKey: PointCategoryValue | '') =>
              onCategoryChange(selectedKey)
            }
            value={selectedCategory || undefined}
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
            onChange={(e) => onDifferenceChange(e.target.value)}
            readOnly={isAutoFilled}
            className={isAutoFilled ? 'cursor-not-allowed bg-gray-100' : ''}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor='memo' required>
            메모
          </Label>
          <Input
            type='text'
            id='memo'
            placeholder='이벤트 참여 포인트 지급, 시험 후기 오류 제보 등'
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
          />
        </div>
      </div>
    </article>
  );
}
