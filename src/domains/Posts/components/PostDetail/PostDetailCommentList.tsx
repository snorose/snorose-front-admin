import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { PaginationBar } from '@/shared/components';

import { searchComments } from '@/apis/comments';

import PostDetailCommentItem from './PostDetailCommentItem';

interface PostDetailCommentListProps {
  postId: number;
  commentCount: number;
}

export default function PostDetailCommentList({
  postId,
  commentCount,
}: PostDetailCommentListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 댓글 목록 조회 (postId만으로 조회)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['postComments', postId, currentPage],
    queryFn: async () => {
      return await searchComments(currentPage, {
        searchQuery: String(postId),
        searchScope: 'POST_ID',
        sortTypes: ['CREATED_AT'],
        sortDirection: 'ASC',
      });
    },
    enabled: !!postId,
  });

  const comments = useMemo(() => data?.data ?? [], [data]);
  const hasNext = data?.hasNext ?? false;
  const totalPage = data?.totalPage ?? 1;

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
        <PaginationBar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPage={totalPage}
        />
      )}
    </div>
  );
}
