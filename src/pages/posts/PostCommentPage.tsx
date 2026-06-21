import { PageHeader } from '@/shared/components';
import { useManagePageUrl } from '@/shared/hooks/useManagePageUrl';

import { CommentFilterPanel } from '@/domains/Comments/components/CommentFilterPanel';
import CommentTable from '@/domains/Comments/components/CommentTable';
import type { CommentSearchParams } from '@/domains/Comments/types';

const COMMENT_SCHEMA = {
  startDate: 'string',
  endDate: 'string',
  keywordAuthor: 'string',
  searchQuery: 'string',
  searchScope: 'string',
  sortDirection: 'string',
  sortTypes: 'array',
  isKeywordExist: 'boolean',
  isReported: 'boolean',
  boardIds: 'array',
  adminCommonStatuses: 'array',
} as const;

export default function PostCommentPage() {
  const { searchParams, currentPage, handleSearchChange, handlePageChange } =
    useManagePageUrl<CommentSearchParams>(COMMENT_SCHEMA);

  return (
    <div className='flex w-full flex-col gap-6 pb-12'>
      <PageHeader
        title='댓글 관리'
        description='커뮤니티에 등록된 댓글을 편집하거나 삭제하고, 더블클릭 및 필터 검색을 활용해 상세 내역을 파악할 수 있습니다.'
      />
      <CommentFilterPanel
        key={JSON.stringify(searchParams)}
        initialFilters={searchParams}
        onFilterChange={handleSearchChange}
      />
      <div className='flex flex-col gap-4'>
        <CommentTable
          searchParams={searchParams}
          refreshKey={0}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
