import { useState } from 'react';

import { PageHeader } from '@/shared/components';

import { PostFilterPanel } from '@/domains/Posts/components/PostFilterPanel';
import PostTable from '@/domains/Posts/components/PostTable';
import { usePostUrl } from '@/domains/Posts/hooks/usePostUrl';

export default function PostManagePage() {
  const { searchParams, currentPage, handleSearchChange, handlePageChange } =
    usePostUrl();
  const [refreshKey] = useState(0);

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
          refreshKey={refreshKey}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
