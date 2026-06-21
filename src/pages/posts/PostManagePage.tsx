import { PageHeader } from '@/shared/components';
import { useManagePageUrl } from '@/shared/hooks/useManagePageUrl';

import { PostFilterPanel } from '@/domains/Posts/components/PostFilterPanel';
import PostTable from '@/domains/Posts/components/PostTable';
import type { PostSearchParams } from '@/domains/Posts/types';

const POST_SCHEMA = {
  encryptedUserId: 'string',
  boardId: 'number',
  isVisible: 'boolean',
  isKeywordExist: 'boolean',
  startDate: 'string',
  endDate: 'string',
  sortTypes: 'string',
  sortDirection: 'string',
  keywordAuthor: 'string',
  keywordPost: 'string',
  postSearchScope: 'string',
  isNotice: 'boolean',
  adminCommonStatuses: 'array',
} as const;

export default function PostManagePage() {
  const { searchParams, currentPage, handleSearchChange, handlePageChange } =
    useManagePageUrl<PostSearchParams>(POST_SCHEMA);

  return (
    <div className='flex w-full flex-col gap-6 pb-12'>
      <PageHeader
        title='게시글 관리'
        description='커뮤니티에 등록된 게시글을 편집하거나 삭제하고, 더블클릭 및 필터 검색을 활용해 상세 내역을 파악할 수 있습니다.'
      />
      <PostFilterPanel
        key={JSON.stringify(searchParams)}
        initialFilters={searchParams}
        onFilterChange={handleSearchChange}
      />
      <div className='h-px w-full bg-gray-100' />
      <div className='flex flex-col gap-4'>
        <PostTable
          searchParams={searchParams}
          refreshKey={0}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
