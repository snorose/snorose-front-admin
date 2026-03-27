import { useState } from 'react';

import { X } from 'lucide-react';

import { Button, Select } from '@/shared/components/ui';

import type {
  InquiryCategory,
  InquiryListParams,
  InquiryStatus,
  InquirySubCategory,
} from '../types';
import { SUB_CATEGORY_MAP } from '../types';

const CATEGORY_OPTIONS: InquiryCategory[] = ['문의', '신고'];
const STATUS_OPTIONS: InquiryStatus[] = ['접수', '진행중', '진행완료', '보류'];

interface InquirySearchProps {
  onSearchChange: (params: Omit<InquiryListParams, 'page'>) => void;
}

export default function InquirySearch({ onSearchChange }: InquirySearchProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<InquiryCategory | undefined>();
  const [subCategory, setSubCategory] = useState<
    InquirySubCategory | undefined
  >();
  const [status, setStatus] = useState<InquiryStatus | undefined>();

  const buildParams = (overrides: Partial<InquiryListParams> = {}) => {
    return {
      keyword: keyword.trim() || undefined,
      category,
      subCategory,
      status,
      ...overrides,
    };
  };

  const handleSearch = () => onSearchChange(buildParams());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryChange = (value: InquiryCategory) => {
    setCategory(value);
    setSubCategory(undefined);
    onSearchChange(buildParams({ category: value, subCategory: undefined }));
  };

  const handleSubCategoryChange = (value: InquirySubCategory) => {
    setSubCategory(value);
    onSearchChange(buildParams({ subCategory: value }));
  };

  const handleStatusChange = (value: InquiryStatus) => {
    setStatus(value);
    onSearchChange(buildParams({ status: value }));
  };

  const handleReset = () => {
    setKeyword('');
    setCategory(undefined);
    setSubCategory(undefined);
    setStatus(undefined);
    onSearchChange({});
  };

  const subCategoryOptions = category ? SUB_CATEGORY_MAP[category] : [];

  return (
    <div className='flex flex-col gap-2'>
      {/* 키워드 검색 */}
      <div className='flex items-center gap-2'>
        <div className='relative w-80'>
          <input
            type='text'
            placeholder='제목, 내용, 아이디로 검색하세요.'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className='h-9 w-full rounded-md border border-gray-500 bg-white px-2 py-2 pr-7 text-[13px] focus:outline-none'
          />
          {keyword && (
            <button
              type='button'
              onClick={() => {
                setKeyword('');
                onSearchChange(buildParams({ keyword: undefined }));
              }}
              className='absolute top-1/2 right-2 z-10 flex -translate-y-1/2 items-center justify-center rounded-sm p-0.5 hover:bg-gray-200'
            >
              <X className='pointer-events-none h-4 w-4 text-gray-600' />
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>조회</Button>
        <Button variant='outline' onClick={handleReset}>
          초기화
        </Button>
      </div>

      {/* 필터 */}
      <div className='flex items-center gap-2'>
        {/* 분류 */}
        <FilterSelect
          value={category}
          placeholder='분류'
          options={CATEGORY_OPTIONS}
          onValueChange={handleCategoryChange}
          onReset={() => {
            setCategory(undefined);
            setSubCategory(undefined);
            onSearchChange(
              buildParams({ category: undefined, subCategory: undefined })
            );
          }}
          width='w-[90px]'
        />

        {/* 중분류 — 분류 선택 시에만 활성화 */}
        <FilterSelect
          value={subCategory}
          placeholder='중분류'
          options={subCategoryOptions}
          onValueChange={handleSubCategoryChange}
          onReset={() => {
            setSubCategory(undefined);
            onSearchChange(buildParams({ subCategory: undefined }));
          }}
          width='w-[130px]'
          disabled={!category}
        />

        {/* 답변여부 */}
        <FilterSelect
          value={status}
          placeholder='답변여부'
          options={STATUS_OPTIONS}
          onValueChange={handleStatusChange}
          onReset={() => {
            setStatus(undefined);
            onSearchChange(buildParams({ status: undefined }));
          }}
          width='w-[110px]'
        />
      </div>
    </div>
  );
}

// ── 재사용 필터 Select ──────────────────────────────────────────────────────
interface FilterSelectProps<T extends string> {
  value: T | undefined;
  placeholder: string;
  options: T[];
  onValueChange: (v: T) => void;
  onReset: (e: React.MouseEvent) => void;
  width: string;
  disabled?: boolean;
}

function FilterSelect<T extends string>({
  value,
  placeholder,
  options,
  onValueChange,
  onReset,
  width,
  disabled,
}: FilterSelectProps<T>) {
  return (
    <Select
      key={value ?? `empty-${placeholder}`}
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      disabled={disabled}
    >
      <Select.Trigger
        className={`relative !h-7 text-xs focus-visible:border focus-visible:ring-0 ${width} ${
          value ? '!bg-blue-100 [&>svg]:hidden' : ''
        }`}
      >
        <Select.Value placeholder={placeholder} />
        {value && (
          <button
            type='button'
            onClick={onReset}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className='pointer-events-auto absolute right-2 z-10 flex items-center justify-center rounded-sm p-0.5 hover:bg-blue-200/80'
          >
            <X className='pointer-events-none h-3 w-3 text-gray-600' />
          </button>
        )}
      </Select.Trigger>
      <Select.Content
        align='start'
        className='bg-blue-50 text-[10px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-state=checked]]:bg-blue-100'
      >
        {options.map((opt) => (
          <Select.Item
            key={opt}
            value={opt}
            className='text-[12px] font-medium'
          >
            {opt}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
