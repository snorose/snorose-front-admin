import { PageHeader } from '@/shared/components';
import { useManagePageUrl } from '@/shared/hooks';

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
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <PageHeader
        title='게시글 관리'
        description='커뮤니티에 등록된 게시글을 편집하거나 삭제하고, 더블클릭 및 필터 검색을 활용해 상세 내역을 파악할 수 있습니다.'
      />
      <div className='flex min-w-0 flex-col gap-6'>
        <PostFilterPanel
          key={JSON.stringify(searchParams)}
          initialFilters={searchParams}
          onFilterChange={handleSearchChange}
        />
        <section
          aria-label='게시글 목록'
          className='flex min-w-0 flex-col gap-1'
        >
          <h2 className='text-lg font-bold'>게시글 목록</h2>
          <PostTable
            searchParams={searchParams}
            refreshKey={0}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </section>
      </div>
    </div>
  );
}
