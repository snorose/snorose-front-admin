import { useState } from 'react';

import CommentList from '@/domains/Comments/components/CommentList';
import PostList from '@/domains/Comments/components/PostList';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

export default function PostCommentPage() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const handleSelectPost = (post: AdminGetPostResponse | null) => {
    setSelectedPostId(post?.postId ?? null);
  };

  return (
    <div className='grid w-full grid-cols-2 gap-6'>
      <PostList
        selectedPostId={selectedPostId}
        onSelectPost={handleSelectPost}
      />
      <CommentList
        key={selectedPostId ?? 'none'}
        selectedPostId={selectedPostId}
      />
    </div>
  );
}
