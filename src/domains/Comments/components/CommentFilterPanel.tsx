import { useId, useState } from 'react';

import { Input, Label, Select } from '@/shared/components/ui';
import {
  type AdminStatus,
  BOARD_OPTIONS,
  STATUS_OPTIONS,
} from '@/shared/utils';

import type { CommentSearchParams } from '../types';

interface CommentFilterPanelProps {
  onFilterChange: (filters: CommentSearchParams) => void;
  totalCount?: number;
  initialFilters?: CommentSearchParams;
}

export const CommentFilterPanel = ({
  onFilterChange,
  totalCount,
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
    <div className='flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6'>
      <div className='flex items-center gap-2 font-semibold text-gray-800'>
        <span>검색 / 필터</span>
      </div>

      {/* 작성일 기간 */}
      <div className='flex flex-col gap-1'>
        <span className='text-sm leading-5 font-medium text-gray-600'>
          작성일 기간
        </span>
        <div className='flex gap-4'>
          <div className='flex flex-1 flex-col gap-1'>
            <Label
              htmlFor={`${inputId}-startDate`}
              className='py-0 text-xs leading-4 font-normal text-gray-500'
            >
              시작일
            </Label>
            <Input
              id={`${inputId}-startDate`}
              type='date'
              value={filters.startDate ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value || undefined,
                }))
              }
            />
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <Label
              htmlFor={`${inputId}-endDate`}
              className='py-0 text-xs leading-4 font-normal text-gray-500'
            >
              종료일
            </Label>
            <Input
              id={`${inputId}-endDate`}
              type='date'
              value={filters.endDate ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value || undefined,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* 게시자 / 게시글 검색 */}
      <div className='flex gap-4'>
        <div className='flex flex-1 flex-col gap-1'>
          <Label
            htmlFor={`${inputId}-keywordAuthor`}
            className='py-0 text-sm leading-5 font-medium text-gray-600'
          >
            게시자 검색 (아이디/닉네임/학번)
          </Label>
          <Input
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
        </div>
        <div className='flex flex-1 flex-col gap-1'>
          <Label
            htmlFor={`${inputId}-searchQuery`}
            className='py-0 text-sm leading-5 font-medium text-gray-600'
          >
            댓글 검색
          </Label>
          <div className='flex gap-2'>
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
            <Input
              id={`${inputId}-searchQuery`}
              type='text'
              placeholder={
                filters.searchScope === 'COMMENT_ID'
                  ? '댓글 ID (숫자만)'
                  : filters.searchScope === 'PARENT_COMMENT_ID'
                    ? '상위 댓글 ID (숫자만)'
                    : filters.searchScope === 'POST_ID'
                      ? '게시글 ID (숫자만)'
                      : '검색어 입력...'
              }
              value={filters.searchQuery ?? ''}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  searchQuery: e.target.value || undefined,
                }));
              }}
              className='flex-1'
            />
          </div>
        </div>
      </div>

      {/* 정렬 / 의심 키워드 */}
      <div className='flex gap-4'>
        <div className='flex flex-1 flex-col gap-1'>
          <Label
            htmlFor={`${inputId}-sort`}
            className='py-0 text-sm leading-5 font-medium text-gray-600'
          >
            정렬
          </Label>
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
            <Select.Trigger id={`${inputId}-sort`} className='h-9 w-full'>
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
        <div className='flex flex-1 flex-col gap-1'>
          <Label
            htmlFor={`${inputId}-isKeywordExist`}
            className='py-0 text-sm leading-5 font-medium text-gray-600'
          >
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
                isKeywordExist: value === 'ALL' ? undefined : value === 'true',
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

      <div className='flex w-full gap-4'>
        <button
          onClick={handleReset}
          className='w-full rounded border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50'
        >
          초기화
        </button>
        <button
          onClick={() => onFilterChange(filters)}
          className='w-full rounded bg-gray-900 py-2 text-sm font-semibold text-white hover:bg-gray-700'
        >
          검색
        </button>
      </div>
      {totalCount !== undefined && (
        <span className='text-sm text-gray-500'>
          총 <span className='font-semibold text-blue-600'>{totalCount}</span>
          개의 댓글
        </span>
      )}
    </div>
  );
};
