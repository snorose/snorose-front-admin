import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui';

import PostDetailActionModal from '@/domains/Posts/components/PostDetailActionModal';
import PostDetailBlacklistCard from '@/domains/Posts/components/PostDetailBlacklistCard';
import PostDetailCommentList from '@/domains/Posts/components/PostDetailCommentList';
import PostDetailInfoPanel from '@/domains/Posts/components/PostDetailInfoPanel';
import PostDetailManageCard from '@/domains/Posts/components/PostDetailManageCard';
import PostDetailReportCard from '@/domains/Posts/components/PostDetailReportCard';
import PostDetailStatusLogCard from '@/domains/Posts/components/PostDetailStatusLogCard';
import { usePost } from '@/domains/Posts/hooks/usePost';

import { deletePost } from '@/apis';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const numericPostId = postId ? parseInt(postId, 10) : null;

  // 게시글 상세조회 쿼리
  const { post, isLoading, error, refetch } = usePost(numericPostId);

  // 게시글 관리 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE'
  >('HIDE');
  const [reason, setReason] = useState('');
  const [deleteCommentsAlso, setDeleteCommentsAlso] = useState(false);

  // 게시물 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post!.postId),
    onSuccess: () => {
      toast.success(
        deleteCommentsAlso
          ? '게시글과 관련 댓글이 모두 삭제되었습니다.'
          : '게시글이 삭제되었습니다.'
      );
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
    if (modalType === 'DELETE') {
      deleteMutation.mutate();
    }
  };

  // 상세 뷰 구성
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
    <div className='flex w-full flex-col gap-6 pb-12'>
      <div className='flex flex-col gap-6'>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 self-start rounded-lg border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-3.5 w-3.5' /> 목록으로
        </Button>

        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-3'>
          {/* 좌측 2/3 컬럼: 상세 카드 + 댓글 카드 리스트 */}
          <div className='flex flex-col gap-6 lg:col-span-2'>
            <PostDetailInfoPanel post={post} />

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

            {/* 카드 2: 게시글 상태 변경 내역 */}
            <PostDetailStatusLogCard statusLogs={[]} />

            {/* 카드 3: 신고 내역 */}
            <PostDetailReportCard reportCount={post.reportCount} />

            {/* 카드 4: 징계 정보 */}
            <PostDetailBlacklistCard />
          </div>
        </div>

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
    </div>
  );
}
