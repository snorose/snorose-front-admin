import { useState } from 'react';

import CommentList from '@/domains/Comments/components/CommentList';
import PostDetailModal from '@/domains/Comments/components/PostDetailModal';
import PostList from '@/domains/Comments/components/PostList';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

export default function PostCommentPage() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [modalPostId, setModalPostId] = useState<AdminGetPostResponse | null>(
    null
  );

  const handleSelectPost = (post: AdminGetPostResponse | null) => {
    setSelectedPostId(post?.postId ?? null);
  };

  return (
    <div className='grid w-full grid-cols-2 gap-6'>
      <PostList
        selectedPostId={selectedPostId}
        onSelectPost={handleSelectPost}
        onOpenModal={(post: AdminGetPostResponse) => setModalPostId(post)}
      />
      <CommentList
        key={selectedPostId ?? 'none'}
        selectedPostId={selectedPostId}
      />
      <PostDetailModal
        postId={modalPostId?.postId ?? null}
        deletedAt={modalPostId ? (modalPostId.deletedAt ?? null) : null}
        onClose={() => setModalPostId(null)}
      />
    </div>
  );
}
