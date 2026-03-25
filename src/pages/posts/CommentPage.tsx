import { useState } from 'react';

import CommentList from '@/domains/Comments/components/CommentList';
import PostList from '@/domains/Comments/components/PostList';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

export default function CommentPage() {
  const [selectedPost, setSelectedPost] = useState<AdminGetPostResponse | null>(
    null
  );

  return (
    <div className='grid w-full grid-cols-2 gap-6'>
      <PostList
        selectedPostId={selectedPost?.postId ?? null}
        onSelectPost={setSelectedPost}
      />
      <CommentList selectedPostId={selectedPost?.postId ?? null} />
    </div>
  );
}
