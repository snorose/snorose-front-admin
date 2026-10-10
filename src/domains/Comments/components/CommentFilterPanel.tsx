import { type KeyboardEvent, useId, useState } from 'react';

import { Search } from 'lucide-react';

import { DatePicker, FilterMultiSelect } from '@/shared/components';
import {
  Button,
  Input,
  InputGroup,
  Label,
  Select,
} from '@/shared/components/ui';
import { BOARD_OPTIONS, STATUS_OPTIONS } from '@/shared/utils';

import type { CommentSearchParams } from '../types';

interface CommentFilterPanelProps {
  onFilterChange: (filters: CommentSearchParams) => void;
  initialFilters?: CommentSearchParams;
}

export const CommentFilterPanel = ({
  onFilterChange,
  initialFilters = {},
}: CommentFilterPanelProps) => {
  const inputId = useId();
  const [filters, setFilters] = useState<CommentSearchParams>({
    searchScope: 'CONTENT',
    ...initialFilters,
  });

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const defaultFilters = { searchScope: 'CONTENT' as const };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <section
      aria-labelledby={`${inputId}-heading`}
      className='flex min-w-0 flex-col gap-1'
    >
      <h2 id={`${inputId}-heading`} className='text-lg font-bold'>
        댓글 검색
      </h2>

      <form
        aria-labelledby={`${inputId}-heading`}
        className='border-border bg-background @container flex min-w-0 flex-col gap-4 rounded-md border p-4'
        onSubmit={(event) => {
          event.preventDefault();
          onFilterChange(filters);
        }}
      >
        <div className='flex min-w-0 flex-col gap-4'>
          {/* 게시자 / 게시글 검색 */}
          <div className='grid min-w-0 grid-cols-1 items-end gap-4 @md:grid-cols-2 @5xl:grid-cols-4'>
            <div className='flex min-w-0 flex-col gap-1 @md:col-span-2'>
              <Label htmlFor={`${inputId}-searchQuery`}>댓글 검색어</Label>
              <div className='flex min-w-0 gap-2'>
                <Select
                  value={filters.searchScope ?? 'CONTENT'}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchScope: value as CommentSearchParams['searchScope'],
                    }))
                  }
                >
                  <Select.Trigger
                    id={`${inputId}-searchScope`}
                    aria-label='댓글 검색 범위'
                    className='h-9 w-35 shrink-0 shadow-none'
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content align='start'>
                    <Select.Item value='CONTENT'>내용</Select.Item>
                    <Select.Item value='COMMENT_ID'>댓글 ID</Select.Item>
                    <Select.Item value='PARENT_COMMENT_ID'>
                      상위 댓글 ID
                    </Select.Item>
                    <Select.Item value='POST_ID'>게시글 ID</Select.Item>
                  </Select.Content>
                </Select>
                <InputGroup className='min-w-0 flex-1 shadow-none'>
                  <InputGroup.Addon>
                    <Search aria-hidden='true' />
                  </InputGroup.Addon>
                  <InputGroup.Input
                    id={`${inputId}-searchQuery`}
                    aria-label='댓글 검색'
                    type='text'
                    placeholder={
                      filters.searchScope === 'COMMENT_ID'
                        ? '댓글 ID (숫자만)'
                        : filters.searchScope === 'PARENT_COMMENT_ID'
                          ? '상위 댓글 ID (숫자만)'
                          : filters.searchScope === 'POST_ID'
                            ? '게시글 ID (숫자만)'
                            : '댓글 검색어'
                    }
                    value={filters.searchQuery ?? ''}
                    onKeyDown={handleSearchKeyDown}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        searchQuery: e.target.value || undefined,
                      }));
                    }}
                  />
                </InputGroup>
              </div>
            </div>
            <div className='flex min-w-0 flex-col gap-1 @md:col-span-2 @5xl:col-span-1'>
              <Label htmlFor={`${inputId}-keywordAuthor`}>작성자</Label>
              <Input
                className='shadow-none'
                id={`${inputId}-keywordAuthor`}
                aria-label='게시자 검색 (아이디/닉네임/학번)'
                type='text'
                placeholder='아이디, 닉네임, 학번'
                value={filters.keywordAuthor ?? ''}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    keywordAuthor: e.target.value || undefined,
                  }))
                }
              />
            </div>
            {/* 작성 시작일 / 작성 종료일 */}
            <fieldset className='min-w-0 @md:col-span-2 @5xl:col-span-1'>
              <legend className='mb-1 py-1 text-sm leading-none font-semibold'>
                작성 기간
              </legend>
              <div className='flex min-w-0 items-center gap-1'>
                <div className='min-w-0 flex-1'>
                  <Label className='sr-only' htmlFor={`${inputId}-startDate`}>
                    작성 시작일
                  </Label>
                  <DatePicker
                    className='gap-1 px-2 shadow-none'
                    id={`${inputId}-startDate`}
                    placeholder='시작일'
                    value={filters.startDate}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        startDate: value,
                      }))
                    }
                  />
                </div>
                <span aria-hidden='true' className='text-muted-foreground'>
                  ~
                </span>
                <div className='min-w-0 flex-1'>
                  <Label className='sr-only' htmlFor={`${inputId}-endDate`}>
                    작성 종료일
                  </Label>
                  <DatePicker
                    className='gap-1 px-2 shadow-none'
                    id={`${inputId}-endDate`}
                    placeholder='종료일'
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
            </fieldset>
          </div>

          <div className='grid min-w-0 grid-cols-1 items-end gap-4 @md:grid-cols-2 @5xl:grid-cols-4'>
            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor={`${inputId}-sort`}>정렬</Label>
              <Select
                value={
                  filters.sortTypes?.[0] && filters.sortDirection
                    ? `${filters.sortTypes[0]}|${filters.sortDirection}`
                    : 'CREATED_AT|DESC'
                }
                onValueChange={(value) => {
                  const [sortType, sortDirection] = value.split('|');
                  setFilters((prev) => ({
                    ...prev,
                    sortTypes: [sortType] as CommentSearchParams['sortTypes'],
                    sortDirection:
                      sortDirection as CommentSearchParams['sortDirection'],
                  }));
                }}
              >
                <Select.Trigger
                  id={`${inputId}-sort`}
                  className='h-9 w-full min-w-0 shadow-none'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  <Select.Item value='CREATED_AT|DESC'>최신순</Select.Item>
                  <Select.Item value='CREATED_AT|ASC'>오래된순</Select.Item>
                  <Select.Item value='REPORT_COUNT|DESC'>신고 수</Select.Item>
                  <Select.Item value='LIKE_COUNT|DESC'>좋아요 수</Select.Item>
                  <Select.Item value='CHILD_COMMENT_COUNT|DESC'>
                    댓글 수
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className='min-w-0'>
              <FilterMultiSelect
                label='게시판'
                value={filters.boardIds ?? []}
                options={BOARD_OPTIONS}
                onValueChange={(boardIds) =>
                  setFilters((prev) => ({
                    ...prev,
                    boardIds: boardIds.length ? boardIds : undefined,
                  }))
                }
              />
            </div>
            <div className='min-w-0'>
              <FilterMultiSelect
                label='관리 상태'
                value={filters.adminCommonStatuses ?? []}
                options={STATUS_OPTIONS}
                onValueChange={(statuses) =>
                  setFilters((prev) => ({
                    ...prev,
                    adminCommonStatuses: statuses.length ? statuses : undefined,
                  }))
                }
              />
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
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
                  className='h-9 w-full min-w-0 shadow-none'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  <Select.Item value='ALL'>전체</Select.Item>
                  <Select.Item value='true'>의심 키워드 있음</Select.Item>
                  <Select.Item value='false'>의심 키워드 없음</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-3 pt-4 @md:flex-row @md:items-center'>
          <div className='flex gap-2 @md:ml-auto'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleReset}
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
              aria-label='검색 조건 초기화'
            >
              초기화
            </Button>
            <Button
              type='submit'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
            >
              검색
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};
