import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import { extractFirstSearchMember } from '@/domains/MemberInfo/utils/memberDirectory';
import PostDetailActionModal from '@/domains/Posts/components/PostDetailActionModal';
import PostDetailBlacklistCard from '@/domains/Posts/components/PostDetailBlacklistCard';
import PostDetailCommentList from '@/domains/Posts/components/PostDetailCommentList';
import PostDetailInfoPanel from '@/domains/Posts/components/PostDetailInfoPanel';
import PostDetailManageCard from '@/domains/Posts/components/PostDetailManageCard';
import PostDetailReportCard from '@/domains/Posts/components/PostDetailReportCard';
import PostDetailStatusLogCard, {
  type StatusLog,
} from '@/domains/Posts/components/PostDetailStatusLogCard';

import {
  blacklistHistoryAPI,
  deletePost,
  getPost,
  updatePostVisibility,
} from '@/apis';
import { searchUsersAPI } from '@/apis/users';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const numericPostId = postId ? parseInt(postId, 10) : null;

  // 닉네임 팝오버 상태
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null);
  const [popoverUser, setPopoverUser] = useState<MemberInfo | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // 로컬 페이지 번호 상태
  const [, setPopoverPage] = useState(1);

  // 게시글 상세조회 쿼리
  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['postDetail', numericPostId],
    queryFn: () => getPost(numericPostId!),
    enabled: !!numericPostId,
  });

  // 게시글 관리 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE'
  >('HIDE');
  const [reason, setReason] = useState('');
  const [deleteCommentsAlso, setDeleteCommentsAlso] = useState(false);

  // 상태 변경 로그 관리
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);

  const handleAddStatusLog = (newLog: Omit<StatusLog, 'id'>) => {
    setStatusLogs((prev) => [
      {
        id: prev.length > 0 ? Math.max(...prev.map((l) => l.id)) + 1 : 1,
        ...newLog,
      },
      ...prev,
    ]);
  };

  // 징계 정보 쿼리
  const { data: blacklistHistory } = useQuery({
    queryKey: ['postAuthorBlacklist', post?.encryptedUserId],
    queryFn: () => blacklistHistoryAPI(post!.encryptedUserId),
    enabled: !!post?.encryptedUserId,
  });

  // 게시물 가시성(노출/숨김) 변경 Mutation
  const visibilityMutation = useMutation({
    mutationFn: ({ isVisible }: { isVisible: boolean }) =>
      updatePostVisibility([post!.postId], isVisible),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isVisible
          ? '게시글이 공개되었습니다.'
          : '게시글이 비공개 처리되었습니다.'
      );
      handleAddStatusLog({
        changedAt: new Date().toISOString(),
        admin: '관리자',
        reason: variables.isVisible ? '비공개 해제' : '관리자비공개',
        statusBefore: post!.isVisible ? '공개' : '비공개',
        statusAfter: variables.isVisible ? '공개' : '비공개',
        detailReason: reason,
      });
      refetch();
      setIsModalOpen(false);
      setReason('');
    },
    onError: () => {
      toast.error('상태 변경에 실패했습니다.');
    },
  });

  // 게시물 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post!.postId),
    onSuccess: () => {
      toast.success(
        deleteCommentsAlso
          ? '게시글과 관련 댓글이 모두 삭제되었습니다.'
          : '게시글이 삭제되었습니다.'
      );
      handleAddStatusLog({
        changedAt: new Date().toISOString(),
        admin: '관리자',
        reason: '관리자삭제',
        statusBefore: post!.isVisible ? '공개' : '비공개',
        statusAfter: '삭제',
        detailReason:
          reason + (deleteCommentsAlso ? ' (댓글 일괄 삭제 포함)' : ''),
      });
      refetch();
      setIsModalOpen(false);
      setReason('');
      setDeleteCommentsAlso(false);
    },
    onError: () => {
      toast.error('게시글 삭제에 실패했습니다.');
    },
  });

  // 모달 확인 클릭
  const handleConfirmAction = () => {
    if (!reason.trim()) return;
    if (modalType === 'HIDE') {
      visibilityMutation.mutate({ isVisible: false });
    } else if (modalType === 'SHOW' || modalType === 'RESTORE') {
      visibilityMutation.mutate({ isVisible: true });
    } else if (modalType === 'DELETE') {
      deleteMutation.mutate();
    }
  };

  // 작성자 닉네임 클릭 처리
  const handleNicknameClick = useCallback(
    async (
      e: React.MouseEvent,
      targetPost: { nickName?: string; encryptedUserId: string; postId: number }
    ) => {
      e.stopPropagation();

      if (activePopoverId === targetPost.postId) {
        setActivePopoverId(null);
        setPopoverUser(null);
        return;
      }

      setActivePopoverId(targetPost.postId);
      setPopoverUser(null);
      setIsUserLoading(true);

      try {
        const display = targetPost.nickName || '익명';
        const res = await searchUsersAPI(display);
        const member = extractFirstSearchMember(res?.result);
        if (member) {
          setPopoverUser(member);
        } else {
          setPopoverUser({
            encryptedUserId: targetPost.encryptedUserId,
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
    },
    [activePopoverId]
  );

  // 신고 내역 목록
  const reportsList = useMemo(() => {
    if (!post || post.reportCount === 0) return [];
    return [
      {
        id: 1,
        reportedAt: '2026-04-29T07:45:00Z',
        reporter: '컴공24',
        reason: '상업적 광고 및 판매글',
      },
    ];
  }, [post]);

  // 상세 뷰 구성
  const detailBody = useMemo(() => {
    if (isLoading) {
      return (
        <div className='flex h-60 items-center justify-center gap-2 text-gray-500'>
          <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
          <span>게시글 상세 정보를 불러오는 중입니다...</span>
        </div>
      );
    }

    if (error || !post) {
      return (
        <div className='flex h-60 flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-gray-500 shadow-sm'>
          <span className='text-sm font-semibold text-red-500'>
            게시글 정보를 찾을 수 없거나 불러오지 못했습니다.
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(-1)}
            className='mt-2'
          >
            이전 화면으로 돌아가기
          </Button>
        </div>
      );
    }

    return (
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-3'>
        {/* 좌측 2/3 컬럼: 상세 카드 + 댓글 카드 리스트 */}
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <PostDetailInfoPanel
            post={post}
            activePopoverId={activePopoverId}
            onNicknameClick={(e) =>
              handleNicknameClick(e, {
                nickName: post.nickName,
                encryptedUserId: post.encryptedUserId,
                postId: post.postId,
              })
            }
            popoverUser={popoverUser}
            isUserLoading={isUserLoading}
            onClosePopover={() => {
              setActivePopoverId(null);
              setPopoverUser(null);
            }}
            onPageChange={setPopoverPage}
          />

          {/* 댓글 목록 */}
          <PostDetailCommentList
            postId={post.postId}
            boardId={post.boardId}
            onCommentCountChange={refetch}
          />
        </div>

        {/* 우측 1/3 컬럼: 세로 카드 스택 */}
        <div className='flex flex-col gap-5 lg:col-span-1'>
          {/* 카드 1: 게시글 관리 */}
          <PostDetailManageCard
            post={post}
            onActionTrigger={(type) => {
              setModalType(type);
              setIsModalOpen(true);
            }}
          />

          {/* 카드 2: 신고 내역 */}
          <PostDetailReportCard
            reportCount={post.reportCount}
            reportsList={reportsList}
          />

          {/* 카드 3: 게시글 상태 변경 내역 */}
          <PostDetailStatusLogCard statusLogs={statusLogs} />

          {/* 카드 4: 징계 정보 */}
          <PostDetailBlacklistCard
            blacklistHistory={blacklistHistory?.result?.data ?? []}
          />
        </div>
      </div>
    );
  }, [
    isLoading,
    error,
    post,
    activePopoverId,
    popoverUser,
    isUserLoading,
    statusLogs,
    blacklistHistory,
    reportsList,
    handleNicknameClick,
    navigate,
    refetch,
  ]);

  return (
    <div
      className='flex w-full flex-col gap-6 pb-12'
      onClick={() => {
        setActivePopoverId(null);
        setPopoverUser(null);
      }}
    >
      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 rounded-lg border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-3.5 w-3.5' /> 목록으로
        </Button>
      </div>

      {detailBody}

      {/* 상태 변경 사유 모달 */}
      <PostDetailActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReason('');
          setDeleteCommentsAlso(false);
        }}
        modalType={modalType}
        reason={reason}
        onReasonChange={setReason}
        deleteCommentsAlso={deleteCommentsAlso}
        onDeleteCommentsAlsoChange={setDeleteCommentsAlso}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
