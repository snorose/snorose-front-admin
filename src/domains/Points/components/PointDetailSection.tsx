import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { POINT_CATEGORY } from '@/constants';

interface PointDetailSectionProps {
  selectedCategory: keyof typeof POINT_CATEGORY | '';
  onCategoryChange: (category: keyof typeof POINT_CATEGORY | '') => void;
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
  return (
    <article className='flex flex-col gap-1'>
      <h3 className='text-lg font-bold'>지급할 포인트 상세</h3>
      <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4 pb-5'>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='category' required>
            포인트 유형
          </Label>
          <Select
            onValueChange={(selectedKey: keyof typeof POINT_CATEGORY | '') =>
              onCategoryChange(selectedKey)
            }
            value={selectedCategory ?? undefined}
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
            onChange={(e) => onDifferenceChange(e.target.value)}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor='memo'>메모</Label>
          <Input
            type='text'
            id='memo'
            placeholder='이벤트 당첨 포인트 지급, 시험 후기 오류 제보 등'
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
          />
        </div>
      </div>
    </article>
  );
}
