import { useId, useState } from 'react';

import { Search } from 'lucide-react';

import { AdvancedSearchFilters, DatePicker } from '@/shared/components';
import { Button, InputGroup, Label, Select } from '@/shared/components/ui';
import {
  type AdminStatus,
  BOARD_OPTIONS,
  STATUS_OPTIONS,
} from '@/shared/utils';

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

  const handleStatusToggle = (status: AdminStatus) => {
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
    setFilters((prev) => {
      const current = prev.boardIds ?? [];
      const exists = current.includes(boardId);

      return {
        ...prev,
        boardIds: exists
          ? current.filter((id) => id !== boardId)
          : [...current, boardId],
      };
    });
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

      <div className='flex min-w-0 flex-col gap-4 rounded-md border p-4 pb-5'>
        <div className='flex min-w-0 flex-col gap-4'>
          {/* 게시자 / 게시글 검색 */}
          <div className='flex flex-wrap items-end gap-2'>
            <div className='flex w-full min-w-0 flex-col gap-1 sm:w-80'>
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
                    className='h-9 w-35 shrink-0'
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
                <InputGroup className='min-w-0 flex-1'>
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
            <div className='flex w-full min-w-0 flex-col gap-1 sm:w-60'>
              <Label htmlFor={`${inputId}-keywordAuthor`}>작성자</Label>
              <InputGroup>
                <InputGroup.Addon>
                  <Search aria-hidden='true' />
                </InputGroup.Addon>
                <InputGroup.Input
                  id={`${inputId}-keywordAuthor`}
                  aria-label='게시자 검색 (아이디/닉네임/학번)'
                  type='text'
                  placeholder='게시자 검색 (아이디/닉네임/학번)'
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
            {/* 작성 시작일 / 작성 종료일 */}
            <fieldset className='flex w-full min-w-0 flex-col gap-1 sm:w-auto'>
              <legend className='py-1 text-sm leading-none font-semibold'>
                작성 기간
              </legend>
              <div className='flex w-full min-w-0 items-center gap-2 sm:w-auto'>
                <div className='flex min-w-0 flex-1 flex-col gap-1 sm:w-40 sm:flex-none'>
                  <Label className='sr-only' htmlFor={`${inputId}-startDate`}>
                    작성 시작일
                  </Label>
                  <DatePicker
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
                <div className='flex min-w-0 flex-1 flex-col gap-1 sm:w-40 sm:flex-none'>
                  <Label className='sr-only' htmlFor={`${inputId}-endDate`}>
                    작성 종료일
                  </Label>
                  <DatePicker
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

          <AdvancedSearchFilters>
            <div className='flex min-w-0 flex-col gap-4'>
              {/* 정렬 / 의심 키워드 */}
              <div className='flex flex-wrap items-center gap-2'>
                <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
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
                        sortTypes: [
                          sortType,
                        ] as CommentSearchParams['sortTypes'],
                        sortDirection:
                          sortDirection as CommentSearchParams['sortDirection'],
                      }));
                    }}
                  >
                    <Select.Trigger
                      id={`${inputId}-sort`}
                      className='h-9 w-full'
                    >
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content align='start'>
                      <Select.Item value='CREATED_AT|DESC'>최신순</Select.Item>
                      <Select.Item value='CREATED_AT|ASC'>오래된순</Select.Item>
                      <Select.Item value='REPORT_COUNT|DESC'>
                        신고 수
                      </Select.Item>
                      <Select.Item value='LIKE_COUNT|DESC'>
                        좋아요 수
                      </Select.Item>
                      <Select.Item value='CHILD_COMMENT_COUNT|DESC'>
                        댓글 수
                      </Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                  <Label htmlFor={`${inputId}-isKeywordExist`}>
                    의심 키워드
                  </Label>
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
                      <Select.Item value='true'>의심 키워드 있음</Select.Item>
                      <Select.Item value='false'>의심 키워드 없음</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </div>

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
                        boardIds: undefined,
                      }))
                    }
                    className={`rounded-full border px-3 py-1 text-sm ${
                      !filters.boardIds?.length
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
                        filters.boardIds?.includes(option.value)
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
          </AdvancedSearchFilters>
        </div>
        <div className='flex flex-wrap justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleReset}
            className='w-24'
            aria-label='검색 조건 초기화'
          >
            초기화
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={() => onFilterChange(filters)}
            className='w-16'
          >
            검색
          </Button>
        </div>
      </div>
    </section>
  );
};
