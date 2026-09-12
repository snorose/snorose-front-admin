import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { PaginationBar } from '@/shared/components';
import { useStableTotalPage } from '@/shared/hooks';
import { clampOneBasedPage } from '@/shared/utils';

import { searchComments } from '@/apis/comments';

import PostDetailCommentItem from './PostDetailCommentItem';
import PostDetailCommentReportCard from './PostDetailCommentReportCard';
import PostDetailCommentSanctionCard from './PostDetailCommentSanctionCard';

interface PostDetailCommentListProps {
  postId: number;
  commentCount: number;
}

export default function PostDetailCommentList({
  postId,
  commentCount,
}: PostDetailCommentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );
  const commentPanelRef = useRef<HTMLDivElement>(null);
  const commentItemRefs = useRef(new Map<number, HTMLDivElement>());
  const [selectedCommentTop, setSelectedCommentTop] = useState(0);

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
  const totalPage = useStableTotalPage(data?.totalPage, currentPage);

  useEffect(() => {
    if (isLoading) return;

    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) setCurrentPage(validPage);
  }, [currentPage, isLoading, totalPage]);

  useEffect(() => {
    setSelectedCommentId(null);
  }, [currentPage, postId]);

  const updateSelectedCommentTop = useCallback(() => {
    if (selectedCommentId === null || !commentPanelRef.current) return;

    const selectedElement = commentItemRefs.current.get(selectedCommentId);
    if (!selectedElement) return;

    const panelTop = commentPanelRef.current.getBoundingClientRect().top;
    const commentTop = selectedElement.getBoundingClientRect().top;
    setSelectedCommentTop(commentTop - panelTop);
  }, [selectedCommentId]);

  useLayoutEffect(() => {
    updateSelectedCommentTop();
    window.addEventListener('resize', updateSelectedCommentTop);

    return () => {
      window.removeEventListener('resize', updateSelectedCommentTop);
    };
  }, [comments, updateSelectedCommentTop]);

  const selectedComment = comments.find(
    (comment) => comment.commentId === selectedCommentId
  );

  return (
    <div className='mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6'>
      <div
        ref={commentPanelRef}
        className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2'
      >
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
          <div className='flex flex-col gap-4'>
            {comments.map((comment) => {
              const isSelected = selectedCommentId === comment.commentId;

              return (
                <div
                  key={comment.commentId}
                  ref={(element) => {
                    if (element) {
                      commentItemRefs.current.set(comment.commentId, element);
                    } else {
                      commentItemRefs.current.delete(comment.commentId);
                    }
                  }}
                >
                  <PostDetailCommentItem
                    comment={comment}
                    isSelected={isSelected}
                    onSelect={(commentId) =>
                      setSelectedCommentId((previousId) =>
                        previousId === commentId ? null : commentId
                      )
                    }
                  />

                  {isSelected && (
                    <div className='mt-4 flex flex-col gap-4 lg:hidden'>
                      <PostDetailCommentReportCard
                        commentId={comment.commentId}
                      />
                      <PostDetailCommentSanctionCard
                        commentId={comment.commentId}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPage > 1 && (
          <PaginationBar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPage={totalPage}
          />
        )}
      </div>

      <div className='hidden lg:col-span-1 lg:block'>
        {selectedComment && (
          <div
            className='flex flex-col gap-4'
            style={{ marginTop: selectedCommentTop }}
          >
            <PostDetailCommentReportCard
              commentId={selectedComment.commentId}
            />
            <PostDetailCommentSanctionCard
              commentId={selectedComment.commentId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
