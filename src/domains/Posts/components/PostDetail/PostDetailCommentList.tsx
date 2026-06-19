import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui';

import { searchComments } from '@/apis/comments';

import PostDetailCommentItem from './PostDetailCommentItem';

interface PostDetailCommentListProps {
  postId: number;
  boardId?: number;
  commentCount: number;
  onCommentCountChange?: () => void;
}

export default function PostDetailCommentList({
  postId,
  boardId,
  commentCount,
}: PostDetailCommentListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 댓글 목록 조회 (postId만으로 조회, boardId는 있을 때만 포함)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['postComments', postId, currentPage, boardId],
    queryFn: async () => {
      const payload: { postId: number; boardId?: number } = { postId };
      if (boardId !== undefined) payload.boardId = boardId;
      return await searchComments(currentPage - 1, payload);
    },
    enabled: !!postId,
  });

  const comments = useMemo(() => data?.data ?? [], [data]);
  const hasNext = data?.hasNext ?? false;

  return (
    <div className='mt-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
      <h2 className='text-base font-bold text-gray-900'>
        댓글 ({commentCount})
      </h2>

      {isError ? (
        <div className='flex h-32 items-center justify-center text-center text-red-600'>
          댓글 로드 중 오류가 발생했습니다.
          <br />
          {(error as Error)?.message ?? '알 수 없는 오류'}
        </div>
      ) : isLoading ? (
        <div className='flex h-40 items-center justify-center gap-2 text-gray-500'>
          <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
          <span>댓글 목록을 불러오는 중입니다...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className='flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400'>
          등록된 댓글이 없습니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {comments.map((comment) => (
            <PostDetailCommentItem key={comment.commentId} comment={comment} />
          ))}
        </div>
      )}

      {!isLoading && (currentPage > 1 || hasNext) && (
        <div className='flex items-center justify-center gap-2 border-t border-gray-100 pt-4'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='text-xs text-gray-500'>{currentPage}페이지</span>
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={!hasNext}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
