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
import { Button } from '@/shared/components/ui';
import { useStableTotalPage } from '@/shared/hooks';
import { clampOneBasedPage } from '@/shared/utils';

import { useCommentDetail } from '@/domains/Comments/hooks/useCommentDetail';
import { usePostCommentPage } from '@/domains/Comments/hooks/usePostCommentPage';

import { searchComments } from '@/apis/comments';

import PostDetailCommentItem from './PostDetailCommentItem';
import PostDetailCommentReportCard from './PostDetailCommentReportCard';
import PostDetailCommentSanctionCard from './PostDetailCommentSanctionCard';
import PostDetailCommentStatusLogCard from './PostDetailCommentStatusLogCard';

interface PostDetailCommentListProps {
  postId: number;
  commentCount: number;
  focusedCommentId?: number | null;
}

export default function PostDetailCommentList({
  postId,
  commentCount,
  focusedCommentId = null,
}: PostDetailCommentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    focusedCommentId
  );
  const commentPanelRef = useRef<HTMLDivElement>(null);
  const commentItemRefs = useRef(new Map<number, HTMLDivElement>());
  const [selectedCommentTop, setSelectedCommentTop] = useState(0);
  const scrolledCommentId = useRef<number | null>(null);
  const [hasLocatedFocusedComment, setHasLocatedFocusedComment] =
    useState(false);
  const {
    data: linkedComment,
    isLoading: isLinkedCommentLoading,
    isError: isLinkedCommentError,
  } = useCommentDetail(focusedCommentId);
  // URL의 댓글이 실제로 이 게시글에 속할 때만 표시한다.
  const focusedComment =
    linkedComment?.postId === postId &&
    linkedComment.commentId === focusedCommentId
      ? linkedComment
      : undefined;

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
  const linkedPageQuery = usePostCommentPage(
    postId,
    focusedComment,
    !hasLocatedFocusedComment
  );
  const linkedPage = linkedPageQuery.data;

  useEffect(() => {
    if (
      hasLocatedFocusedComment ||
      linkedPage == null ||
      linkedPageQuery.isFetching ||
      linkedPageQuery.isError
    )
      return;
    setCurrentPage(linkedPage);
    setHasLocatedFocusedComment(true);
  }, [
    hasLocatedFocusedComment,
    linkedPage,
    linkedPageQuery.isFetching,
    linkedPageQuery.isError,
  ]);

  useEffect(() => {
    if (isLoading) return;

    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) setCurrentPage(validPage);
  }, [currentPage, isLoading, totalPage]);

  useEffect(() => {
    setSelectedCommentId(focusedCommentId);
  }, [currentPage, postId, focusedCommentId]);

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

  useEffect(() => {
    if (
      !hasLocatedFocusedComment ||
      !focusedComment ||
      scrolledCommentId.current === focusedComment.commentId
    )
      return;
    const element = commentItemRefs.current.get(focusedComment.commentId);
    if (!element) return;
    element.scrollIntoView({ block: 'start' });
    scrolledCommentId.current = focusedComment.commentId;
  }, [hasLocatedFocusedComment, focusedComment, comments]);

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

        {isLinkedCommentLoading && (
          <p role='status' className='text-sm text-gray-500'>
            연결된 댓글을 불러오는 중입니다...
          </p>
        )}
        {(isLinkedCommentError || (linkedComment && !focusedComment)) && (
          <p role='alert' className='text-sm text-red-600'>
            {isLinkedCommentError
              ? '연결된 댓글을 불러오지 못했습니다.'
              : '이 게시글에 속한 댓글이 아닙니다.'}
          </p>
        )}
        {focusedComment &&
          !hasLocatedFocusedComment &&
          (linkedPageQuery.isError || linkedPage === null ? (
            <div role='alert' className='space-y-2 text-sm text-red-600'>
              <p>
                {linkedPageQuery.isError
                  ? '연결된 댓글의 위치를 찾지 못했습니다.'
                  : '댓글 목록에서 연결된 댓글을 찾을 수 없습니다.'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => void linkedPageQuery.refetch()}
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <p role='status' className='text-sm text-gray-500'>
              연결된 댓글의 위치를 찾는 중입니다...
            </p>
          ))}
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
                  role='article'
                  aria-label={`댓글 ${comment.commentId}`}
                  data-selected={isSelected}
                  ref={(element) => {
                    if (element) {
                      commentItemRefs.current.set(comment.commentId, element);
                    } else {
                      commentItemRefs.current.delete(comment.commentId);
                    }
                  }}
                >
                  {comment.commentId === focusedCommentId && (
                    <p className='mb-2 text-xs font-medium text-blue-600'>
                      {comment.commentId}
                    </p>
                  )}
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
                      <PostDetailCommentStatusLogCard
                        key={comment.commentId}
                        commentId={comment.commentId}
                      />
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
            <PostDetailCommentStatusLogCard
              key={selectedComment.commentId}
              commentId={selectedComment.commentId}
            />
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
