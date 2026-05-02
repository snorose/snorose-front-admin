import { type ReactNode, useEffect, useRef } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { formatDateTimeToMinutes } from '@/shared/utils';

import { type PostCommentResponse, getPostCommentsAPI } from '@/apis';

interface ExamReviewCommentSectionProps {
  postId: number | null;
}

export function ExamReviewCommentSection({
  postId,
}: ExamReviewCommentSectionProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const commentsQuery = useInfiniteQuery({
    queryKey: ['post-comments', postId],
    enabled: Boolean(postId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await getPostCommentsAPI(postId!, pageParam);

      if (!response.isSuccess || !response.result) {
        throw new Error(response.message || '댓글 목록을 불러오지 못했습니다.');
      }

      return response.result;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) return undefined;
      return allPages.length;
    },
  });

  const comments = commentsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const isInitialLoading = commentsQuery.isLoading;
  const isFetchingNextPage = commentsQuery.isFetchingNextPage;
  const hasNextPage = commentsQuery.hasNextPage;
  const fetchNextPage = commentsQuery.fetchNextPage;

  useEffect(() => {
    const observerTarget = loadMoreRef.current;

    if (!observerTarget || !postId || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(observerTarget);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, postId]);

  if (!postId) return null;

  const renderComment = (
    comment: PostCommentResponse,
    depth = 0
  ): ReactNode => {
    if (comment.isDeleted || !comment.isVisible) return null;

    return (
      <div key={comment.id} className='flex flex-col gap-2'>
        <article
          className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3'
          style={{ marginLeft: depth * 20 }}
        >
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm font-medium text-gray-900'>
              {comment.userDisplay}
            </span>
            <span className='text-xs text-gray-500'>
              {formatDateTimeToMinutes(comment.createdAt)}
            </span>
          </div>
          <p className='mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-700'>
            {comment.content}
          </p>
        </article>

        {comment.children?.length > 0 && (
          <div className='flex flex-col gap-2'>
            {comment.children.map((child) => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section>
      {isInitialLoading ? (
        <div className='flex items-center justify-center gap-1 py-8 text-sm text-gray-500'>
          <Loader2 className='size-4 animate-spin' />
          불러오는 중...
        </div>
      ) : commentsQuery.isError ? (
        <div className='rounded-md border border-dashed border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-500'>
          댓글 목록을 불러오지 못했습니다.
        </div>
      ) : comments.length === 0 ? (
        <div className='rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500'>
          표시할 댓글이 없습니다.
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {comments.map((comment) => renderComment(comment))}

          <div ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className='flex items-center justify-center gap-1 py-2 text-xs text-gray-500'>
                <Loader2 className='size-3 animate-spin' />
                불러오는 중
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
