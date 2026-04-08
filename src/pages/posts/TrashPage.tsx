import { useState } from 'react';

import { PageHeader } from '@/shared/components';

import DeletedPostList from '@/domains/Comments/components/DeletedPostList';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

export default function TrashPage() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const handleSelectPost = (post: AdminGetPostResponse | null) => {
    setSelectedPostId(post?.postId ?? null);
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='삭제 관리'
        description='삭제된 게시글과 댓글을 관리할 수 있어요.'
      />
      <div className='grid w-full grid-cols-2 gap-6'>
        <DeletedPostList
          selectedPostId={selectedPostId}
          onSelectPost={handleSelectPost}
        />
        <div className='flex h-full min-h-[500px] flex-col rounded-lg border bg-white'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='text-sm font-semibold'>삭제된 댓글</h2>
          </div>
          <div className='flex flex-1 items-center justify-center text-sm text-gray-500'>
            댓글 관리
          </div>
        </div>
      </div>
    </div>
  );
}
