import { useId, useState } from 'react';

import { RotateCcw, Search } from 'lucide-react';

import { DatePicker } from '@/shared/components';
import { Button, InputGroup, Label, Select } from '@/shared/components/ui';
import { BOARD_OPTIONS, STATUS_OPTIONS } from '@/shared/utils';

import type { PostSearchParams } from '../types';

interface PostFilterPanelProps {
  onFilterChange: (filters: PostSearchParams) => void;
  totalCount?: number;
  initialFilters?: PostSearchParams;
}

export const PostFilterPanel = ({
  onFilterChange,
  totalCount,
  initialFilters = {},
}: PostFilterPanelProps) => {
  const inputId = useId();
  const [filters, setFilters] = useState<PostSearchParams>(initialFilters);

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => {
      const current = prev.adminCommonStatuses ?? [];
      const exists = current.includes(status);
      return {
        ...prev,
        adminCommonStatuses: exists
          ? current.filter((s) => s !== status)
          : [...current, status],
      };
    });
  };

  const handleBoardToggle = (boardId: number) => {
    setFilters((prev) => ({
      ...prev,
      boardId: prev.boardId === boardId ? undefined : boardId,
    }));
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <section
      aria-labelledby={`${inputId}-heading`}
      className='flex min-w-0 flex-col gap-1'
    >
      <h2 id={`${inputId}-heading`} className='text-lg font-bold'>
        게시글 검색
      </h2>

      <div className='flex min-w-0 flex-col gap-4 rounded-md border p-4 pb-5'>
        {/* 작성 시작일 / 작성 종료일 */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <Label htmlFor={`${inputId}-startDate`}>작성 시작일</Label>
            <DatePicker
              id={`${inputId}-startDate`}
              placeholder='작성 시작일 선택'
              value={filters.startDate}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: value,
                }))
              }
            />
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <Label htmlFor={`${inputId}-endDate`}>작성 종료일</Label>
            <DatePicker
              id={`${inputId}-endDate`}
              placeholder='작성 종료일 선택'
              value={filters.endDate}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: value,
                }))
              }
            />
          </div>
        </div>

        {/* 게시자 / 게시글 검색 */}
        <div className='flex flex-col gap-4 lg:flex-row'>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <Label htmlFor={`${inputId}-keywordAuthor`}>
              게시자 검색 (아이디/닉네임/학번)
            </Label>
            <InputGroup>
              <InputGroup.Addon>
                <Search aria-hidden='true' />
              </InputGroup.Addon>
              <InputGroup.Input
                id={`${inputId}-keywordAuthor`}
                type='text'
                placeholder='게시자 검색...'
                value={filters.keywordAuthor ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    keywordAuthor: e.target.value || undefined,
                  }))
                }
              />
            </InputGroup>
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <Label htmlFor={`${inputId}-keywordPost`}>게시글 검색</Label>
            <div className='flex min-w-0 gap-2'>
              <Select
                value={filters.postSearchScope ?? 'TITLE_AND_CONTENT'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    postSearchScope:
                      value as PostSearchParams['postSearchScope'],
                  }))
                }
              >
                <Select.Trigger
                  id={`${inputId}-postSearchScope`}
                  aria-label='게시글 검색 범위'
                  className='h-9 w-30 shrink-0'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  <Select.Item value='TITLE_AND_CONTENT'>제목+내용</Select.Item>
                  <Select.Item value='TITLE'>제목</Select.Item>
                  <Select.Item value='CONTENT'>내용</Select.Item>
                </Select.Content>
              </Select>
              <InputGroup className='min-w-0 flex-1'>
                <InputGroup.Addon>
                  <Search aria-hidden='true' />
                </InputGroup.Addon>
                <InputGroup.Input
                  id={`${inputId}-keywordPost`}
                  type='text'
                  placeholder='검색어 입력...'
                  value={filters.keywordPost ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      keywordPost: e.target.value || undefined,
                    }))
                  }
                />
              </InputGroup>
            </div>
          </div>
        </div>

        {/* 정렬 / 의심 키워드 */}
        <div className='flex gap-4'>
          <div className='flex flex-1 flex-col gap-1'>
            <Label htmlFor={`${inputId}-sort`}>정렬</Label>
            <Select
              value={
                filters.sortTypes && filters.sortDirection
                  ? `${filters.sortTypes}|${filters.sortDirection}`
                  : 'CREATED_AT|DESC'
              }
              onValueChange={(value) => {
                const [sortTypes, sortDirection] = value.split('|');
                setFilters((prev) => ({
                  ...prev,
                  sortTypes: sortTypes as PostSearchParams['sortTypes'],
                  sortDirection:
                    sortDirection as PostSearchParams['sortDirection'],
                }));
              }}
            >
              <Select.Trigger id={`${inputId}-sort`} className='h-9 w-full'>
                <Select.Value />
              </Select.Trigger>
              <Select.Content align='start'>
                <Select.Item value='CREATED_AT|DESC'>최신순</Select.Item>
                <Select.Item value='CREATED_AT|ASC'>오래된순</Select.Item>
                <Select.Item value='REPORT_COUNT|DESC'>신고 수</Select.Item>
                <Select.Item value='VIEW_COUNT|DESC'>조회 수</Select.Item>
                <Select.Item value='LIKE_COUNT|DESC'>좋아요 수</Select.Item>
                <Select.Item value='COMMENT_COUNT|DESC'>댓글 수</Select.Item>
                <Select.Item value='SCRAP_COUNT|DESC'>스크랩 수</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <Label htmlFor={`${inputId}-isKeywordExist`}>의심 키워드</Label>
            <Select
              value={
                filters.isKeywordExist === undefined
                  ? 'ALL'
                  : String(filters.isKeywordExist)
              }
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  isKeywordExist:
                    value === 'ALL' ? undefined : value === 'true',
                }))
              }
            >
              <Select.Trigger
                id={`${inputId}-isKeywordExist`}
                className='h-9 w-full'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content align='start'>
                <Select.Item value='ALL'>전체</Select.Item>
                <Select.Item value='true'>있음</Select.Item>
                <Select.Item value='false'>없음</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>

        {/* 공지만 보기 */}
        <label className='flex items-center gap-2 text-sm text-gray-700'>
          <input
            type='checkbox'
            checked={filters.isNotice ?? false}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                isNotice: e.target.checked || undefined,
              }))
            }
          />
          공지만 보기
        </label>

        {/* 게시판 필터 */}
        <div className='flex flex-col gap-2'>
          <span className='text-sm leading-5 font-medium text-gray-600'>
            게시판 필터
          </span>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  boardId: undefined,
                }))
              }
              className={`rounded-full border px-3 py-1 text-sm ${
                filters.boardId === undefined
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            {BOARD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBoardToggle(option.value)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  filters.boardId === option.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 상태 필터 */}
        <div className='flex flex-col gap-2'>
          <span className='text-sm leading-5 font-medium text-gray-600'>
            상태 필터
          </span>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  adminCommonStatuses: undefined,
                }))
              }
              className={`rounded-full border px-3 py-1 text-sm ${
                !filters.adminCommonStatuses?.length
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusToggle(option.value)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  filters.adminCommonStatuses?.includes(option.value)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className='mt-3 flex flex-wrap justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          size='lg'
          onClick={handleReset}
          className='min-w-36'
        >
          <RotateCcw aria-hidden='true' />
          검색 조건 초기화
        </Button>
        <Button
          type='button'
          size='lg'
          onClick={() => onFilterChange(filters)}
          className='w-32'
        >
          <Search aria-hidden='true' />
          검색
        </Button>
      </div>
      {totalCount !== undefined && (
        <span className='text-sm text-gray-500'>
          총 <span className='font-semibold text-blue-600'>{totalCount}</span>
          개의 게시글
        </span>
      )}
    </section>
  );
};
