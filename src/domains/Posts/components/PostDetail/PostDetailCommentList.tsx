import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CornerDownRight, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import MemberInfoPopover from '@/shared/components/MemberInfoPopover';
import { Badge, Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';
import { formatDateTimeWithAmPm } from '@/shared/utils';

import type { AdminCommentResponse } from '@/domains/Comments/types/comment';
import {
  getCommentStatus,
  getCommentStatusBadge,
} from '@/domains/Comments/utils/commentUtils';
import { extractFirstSearchMember } from '@/domains/MemberInfo/utils/memberDirectory';

import {
  deleteComment,
  searchComments,
  updateCommentVisibility,
} from '@/apis/comments';
import { searchUsersAPI } from '@/apis/users';

interface PostDetailCommentListProps {
  postId: number;
  boardId?: number;
  refreshKey?: number;
  onCommentCountChange?: () => void;
}

export default function PostDetailCommentList({
  postId,
  boardId,
  refreshKey,
  onCommentCountChange,
}: PostDetailCommentListProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // 회원 팝오버 상태
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null);
  const [popoverUser, setPopoverUser] = useState<MemberInfo | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // 댓글 상태 변경 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetComment, setTargetComment] =
    useState<AdminCommentResponse | null>(null);
  const [modalType, setModalType] = useState<'HIDE' | 'SHOW' | 'DELETE'>(
    'HIDE'
  );
  const [reason, setReason] = useState('');

  // 댓글 목록 조회 (postId만으로 조회, boardId는 있을 때만 포함)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['postComments', postId, currentPage, boardId, refreshKey],
    queryFn: async () => {
      const payload: { postId: number; boardId?: number } = { postId };
      if (boardId !== undefined) payload.boardId = boardId;
      return await searchComments(currentPage, payload);
    },
    enabled: !!postId,
  });

  const comments = useMemo(() => data?.data ?? [], [data]);
  const hasNext = data?.hasNext ?? false;

  // 댓글 노출/숨김 변경 Mutation
  const visibilityMutation = useMutation({
    mutationFn: (isVisible: boolean) =>
      updateCommentVisibility({
        commentIds: [targetComment!.commentId],
        isVisible,
      }),
    onSuccess: (_, isVisible) => {
      toast.success(
        isVisible ? '댓글이 공개되었습니다.' : '댓글이 비공개 처리되었습니다.'
      );
      refetch();
      setIsModalOpen(false);
      setReason('');
      setTargetComment(null);
    },
    onError: () => {
      toast.error('댓글 상태 변경에 실패했습니다.');
    },
  });

  // 댓글 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(targetComment!.commentId),
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      refetch();
      onCommentCountChange?.();
      setIsModalOpen(false);
      setReason('');
      setTargetComment(null);
    },
    onError: () => {
      toast.error('댓글 삭제에 실패했습니다.');
    },
  });

  const handleConfirmAction = () => {
    if (!reason.trim()) return;
    if (modalType === 'HIDE') visibilityMutation.mutate(false);
    else if (modalType === 'SHOW') visibilityMutation.mutate(true);
    else if (modalType === 'DELETE') deleteMutation.mutate();
  };

  // 작성자 닉네임 클릭 처리
  const handleNicknameClick = async (
    e: React.MouseEvent,
    comment: AdminCommentResponse
  ) => {
    e.stopPropagation();

    if (activePopoverId === comment.commentId) {
      setActivePopoverId(null);
      setPopoverUser(null);
      return;
    }

    setActivePopoverId(comment.commentId);
    setPopoverUser(null);
    setIsUserLoading(true);

    try {
      const display = comment.nickname || comment.userDisplay || '익명';
      const res = await searchUsersAPI(display);
      const member = extractFirstSearchMember(res?.result);
      if (member) {
        setPopoverUser(member);
      } else {
        setPopoverUser({
          encryptedUserId: comment.encryptedUserId,
          loginId: '정보 없음',
          userName: display,
          email: '',
          nickname: display,
          userRoleId: 1,
          studentNumber: '정보 없음',
          major: '정보 없음',
          birthday: '',
          pointBalance: 0,
          createdAt: '',
          authenticatedAt: null,
          totalWarningCount: 0,
          isBlacklist: false,
          blacklistStartDate: null,
          blacklistEndDate: null,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('회원 상세 조회에 실패했습니다.');
    } finally {
      setIsUserLoading(false);
    }
  };

  return (
    <div
      className='mt-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
      onClick={() => {
        setActivePopoverId(null);
        setPopoverUser(null);
      }}
    >
      <h2 className='text-base font-bold text-gray-900'>
        댓글 ({comments.length}
        {hasNext ? '+' : ''})
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
          {comments.map((comment) => {
            const status = getCommentStatus(comment);
            const isSubComment = comment.parentId !== null;

            return (
              <div
                key={comment.commentId}
                className={`flex items-start gap-3 ${isSubComment ? 'pl-8' : ''}`}
              >
                {isSubComment && (
                  <CornerDownRight className='mt-2.5 h-4 w-4 shrink-0 text-gray-400' />
                )}

                <div className='relative flex-1 rounded-xl border border-gray-200 bg-gray-50/50 p-4'>
                  {/* 상단 헤더: 닉네임 + 일시 및 액션 버튼 */}
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                      <span
                        className='cursor-pointer text-sm font-bold text-gray-800 hover:text-blue-600 hover:underline'
                        onClick={(e) => handleNicknameClick(e, comment)}
                      >
                        {comment.nickname || comment.userDisplay || '익명'}
                      </span>
                      <span className='font-mono text-xs text-gray-400'>
                        {formatDateTimeWithAmPm(comment.createdAt)}
                      </span>
                      {status !== '정상' && (
                        <Badge
                          variant='unstyled'
                          className={getCommentStatusBadge(status).className}
                        >
                          {status}
                        </Badge>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className='flex shrink-0 items-center gap-1.5'>
                      {status === '정상' && (
                        <>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 rounded-md border-gray-300 bg-white px-2 text-xs font-medium text-gray-600 hover:bg-gray-100'
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetComment(comment);
                              setModalType('HIDE');
                              setIsModalOpen(true);
                            }}
                          >
                            비공개
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            className='h-7 rounded-md bg-red-600 px-2 text-xs font-medium text-white hover:bg-red-700'
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetComment(comment);
                              setModalType('DELETE');
                              setIsModalOpen(true);
                            }}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                      {(status === '비공개' || status === '관리자비공개') && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 rounded-md border-gray-300 bg-white px-2 text-xs font-medium text-gray-600 hover:bg-gray-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetComment(comment);
                            setModalType('SHOW');
                            setIsModalOpen(true);
                          }}
                        >
                          공개
                        </Button>
                      )}
                      {(status === '삭제됨' ||
                        status === '관리자삭제' ||
                        status === '리자삭제') && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 rounded-md border-gray-300 bg-white px-2 text-xs font-medium text-gray-600 hover:bg-gray-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetComment(comment);
                            setModalType('SHOW');
                            setIsModalOpen(true);
                          }}
                        >
                          복구
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 본문 내용 */}
                  <div className='mt-2.5 text-sm leading-relaxed break-all whitespace-pre-wrap text-gray-700 select-text'>
                    {comment.content}
                  </div>

                  {/* 하단 통계 */}
                  <div className='mt-3 flex items-center gap-3 font-mono text-xs text-gray-400'>
                    <span className='flex items-center gap-0.5' title='공감수'>
                      <Heart className='h-3.5 w-3.5 fill-rose-50 text-rose-400' />
                      {comment.likeCount ?? 0}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 ${comment.reportCount > 0 ? 'font-bold text-red-600' : ''}`}
                      title='신고수'
                    >
                      <AlertTriangle
                        className={`h-3.5 w-3.5 ${comment.reportCount > 0 ? 'text-red-500' : 'text-gray-400'}`}
                      />
                      {comment.reportCount ?? 0}
                    </span>
                  </div>

                  {/* 닉네임 팝오버 렌더링 */}
                  {activePopoverId === comment.commentId && (
                    <div
                      className='absolute top-8 left-10 z-50'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MemberInfoPopover
                        encryptedUserId={comment.encryptedUserId}
                        popoverUser={popoverUser}
                        isUserLoading={isUserLoading}
                        onClose={() => {
                          setActivePopoverId(null);
                          setPopoverUser(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 페이징 */}
      {!isLoading && hasNext && (
        <div className='mt-2 flex justify-center border-t border-gray-100 pt-4'>
          <Button
            variant='outline'
            size='sm'
            className='text-xs'
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            더 보기
          </Button>
        </div>
      )}

      {/* 댓글 조치 사유 기입 모달 */}
      {isModalOpen && targetComment && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg duration-150'>
            <h3 className='mb-2 text-base font-bold text-gray-900'>
              댓글{' '}
              {modalType === 'HIDE'
                ? '비공개'
                : modalType === 'SHOW'
                  ? '공개/복구'
                  : '삭제'}{' '}
              처리
            </h3>
            <p className='mb-4 text-xs text-gray-500'>
              상태를 변경하는 사유를 작성해 주세요. (필수 입력)
            </p>

            <div className='flex flex-col gap-4'>
              <textarea
                className='min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                placeholder='사유를 입력하세요...'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className='mt-2 flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsModalOpen(false);
                    setReason('');
                    setTargetComment(null);
                  }}
                  className='border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50'
                >
                  취소
                </Button>
                <Button
                  variant={modalType === 'DELETE' ? 'destructive' : 'default'}
                  size='sm'
                  onClick={handleConfirmAction}
                  disabled={!reason.trim()}
                  className={`text-xs ${modalType === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
