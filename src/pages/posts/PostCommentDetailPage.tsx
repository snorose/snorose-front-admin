import { Link, Navigate, useParams } from 'react-router-dom';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import { useCommentDetail } from '@/domains/Comments/hooks/useCommentDetail';
import {
  buildCommentDetailUrl,
  parseCommentId,
} from '@/domains/Comments/utils/commentUrls';

export default function PostCommentDetailPage() {
  const { commentId: rawId = '' } = useParams<{ commentId: string }>();
  const commentId = parseCommentId(rawId);
  const { data: comment, isLoading, isError } = useCommentDetail(commentId);

  if (isLoading) {
    return (
      <div
        role='status'
        className='flex w-full items-center justify-center gap-2 py-16 text-sm text-gray-500'
      >
        <Loader2 className='size-4 animate-spin' aria-hidden='true' />
        댓글 상세를 불러오는 중입니다...
      </div>
    );
  }

  if (
    commentId === null ||
    isError ||
    !comment ||
    comment.commentId !== commentId ||
    !Number.isSafeInteger(comment.postId) ||
    comment.postId <= 0
  ) {
    const params = new URLSearchParams({
      searchScope: 'COMMENT_ID',
      searchQuery: rawId,
      page: '1',
    });
    return (
      <div className='flex w-full flex-col items-center justify-center gap-4 py-16'>
        <p role='alert' className='text-sm text-gray-600'>
          댓글 상세를 불러오지 못했습니다.
        </p>
        <Button asChild variant='outline'>
          <Link
            to={
              commentId === null
                ? PATHS.POST_COMMENTS
                : `${PATHS.POST_COMMENTS}?${params}`
            }
          >
            댓글 관리에서 확인
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Navigate to={buildCommentDetailUrl(commentId, comment.postId)} replace />
  );
}
