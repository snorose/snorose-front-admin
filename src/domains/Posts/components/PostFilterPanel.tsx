import { useState } from 'react';

import type { PostSearchParams } from '../types';

const STATUS_OPTIONS = [
  { label: '유저 삭제', value: 'USER_DELETED' },
  { label: '어드민 삭제', value: 'ADMIN_DELETED' },
  { label: '징계', value: 'SANCTIONED' },
  { label: '신고다수+비공개', value: 'AUTO_HIDDEN' },
  { label: '어드민 비공개', value: 'ADMIN_HIDDEN' },
  { label: '노출', value: 'VISIBLE' },
  { label: '징계없음', value: 'DESANCTIONED' },
];

interface PostFilterPanelProps {
  onFilterChange: (filters: PostSearchParams) => void;
  totalCount?: number;
}

export const PostFilterPanel = ({
  onFilterChange,
  totalCount,
}: PostFilterPanelProps) => {
  const [filters, setFilters] = useState<PostSearchParams>({});

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

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className='flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6'>
      <div className='flex items-center gap-2 font-semibold text-gray-800'>
        <span>검색 / 필터</span>
      </div>

      {/* 작성일 기간 */}
      <div className='flex flex-col gap-1'>
        <label className='text-sm text-gray-600'>작성일 기간</label>
        <div className='flex gap-4'>
          <div className='flex flex-1 flex-col gap-1'>
            <label className='text-xs text-gray-500'>시작일</label>
            <input
              type='date'
              value={filters.startDate ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value || undefined,
                }))
              }
              className='rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm'
            />
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <label className='text-xs text-gray-500'>종료일</label>
            <input
              type='date'
              value={filters.endDate ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value || undefined,
                }))
              }
              className='rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm'
            />
          </div>
        </div>
      </div>

      {/* 게시자 / 게시글 검색 */}
      <div className='flex gap-4'>
        <div className='flex flex-1 flex-col gap-1'>
          <label className='text-sm text-gray-600'>
            게시자 검색 (아이디/닉네임/학번)
          </label>
          <input
            type='text'
            placeholder='게시자 검색...'
            value={filters.keywordAuthor ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                keywordAuthor: e.target.value || undefined,
              }))
            }
            className='rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm'
          />
        </div>
        <div className='flex flex-1 flex-col gap-1'>
          <label className='text-sm text-gray-600'>게시글 검색</label>
          <div className='flex gap-2'>
            <select
              value={filters.postSearchScope ?? 'TITLE_AND_CONTENT'}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  postSearchScope: e.target
                    .value as PostSearchParams['postSearchScope'],
                }))
              }
              className='rounded border border-gray-200 bg-gray-50 px-2 py-2 text-sm'
            >
              <option value='TITLE_AND_CONTENT'>제목+내용</option>
              <option value='TITLE'>제목</option>
              <option value='CONTENT'>내용</option>
            </select>
            <input
              type='text'
              placeholder='검색어 입력...'
              value={filters.keywordPost ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  keywordPost: e.target.value || undefined,
                }))
              }
              className='flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm'
            />
          </div>
        </div>
      </div>

      {/* 정렬 / 의심 키워드 */}
      <div className='flex gap-4'>
        <div className='flex flex-1 flex-col gap-1'>
          <label className='text-sm text-gray-600'>정렬</label>
          <select
            onChange={(e) => {
              const [sortTypes, sortDirection] = e.target.value.split('|');
              setFilters((prev) => ({
                ...prev,
                sortTypes: sortTypes as PostSearchParams['sortTypes'],
                sortDirection:
                  sortDirection as PostSearchParams['sortDirection'],
              }));
            }}
            className='rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm'
          >
            <option value='CREATED_AT|DESC'>최신순</option>
            <option value='CREATED_AT|ASC'>오래된순</option>
            <option value='REPORT_COUNT|DESC'>신고 수</option>
            <option value='VIEW_COUNT|DESC'>조회 수</option>
            <option value='LIKE_COUNT|DESC'>좋아요 수</option>
            <option value='COMMENT_COUNT|DESC'>댓글 수</option>
            <option value='SCRAP_COUNT|DESC'>스크랩 수</option>
          </select>
        </div>
        <div className='flex flex-1 flex-col gap-1'>
          <label className='text-sm text-gray-600'>의심 키워드</label>
          <select
            value={
              filters.isKeywordExist === undefined
                ? ''
                : String(filters.isKeywordExist)
            }
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                isKeywordExist:
                  e.target.value === '' ? undefined : e.target.value === 'true',
              }))
            }
            className='rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm'
          >
            <option value=''>전체</option>
            <option value='true'>있음</option>
            <option value='false'>없음</option>
          </select>
        </div>
      </div>

      {/* 초기화 */}
      <button
        onClick={handleReset}
        className='w-full rounded border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50'
      >
        초기화
      </button>

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
        <label className='text-sm text-gray-600'>게시판 필터</label>
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

      {/* 상태 필터 */}
      <div className='flex flex-col gap-2'>
        <label className='text-sm text-gray-600'>상태 필터</label>
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

      {/* 검색 버튼 + 총 개수 */}
      <div className='flex items-center justify-between'>
        {totalCount !== undefined && (
          <span className='text-sm text-gray-500'>
            총 <span className='font-semibold text-blue-600'>{totalCount}</span>
            개의 게시글
          </span>
        )}
        <button
          onClick={() => onFilterChange(filters)}
          className='rounded bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700'
        >
          검색
        </button>
      </div>
    </div>
  );
};
