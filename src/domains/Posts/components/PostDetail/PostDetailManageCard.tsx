import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui';

import { deletePost } from '@/apis';

import type { AdminGetPostResponse } from '../../types';
import PostDetailActionModal from './PostDetailActionModal';

interface PostDetailManageCardProps {
  post: AdminGetPostResponse;
}

export default function PostDetailManageCard({
  post,
}: PostDetailManageCardProps) {
  const isDeleted =
    post.adminCommonStatuses.includes('ADMIN_DELETED') ||
    post.adminCommonStatuses.includes('USER_DELETED');
  const isVisible = !(
    post.adminCommonStatuses.includes('ADMIN_HIDDEN') ||
    post.adminCommonStatuses.includes('AUTO_HIDDEN') ||
    post.adminCommonStatuses.includes('SANCTIONED')
  );
  const queryClient = useQueryClient();

  // 게시물 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: (memo: string) => deletePost(post.postId, memo),
    onMutate: () => {
      return { deleteCommentsAlsoAtMutation: deleteCommentsAlso };
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.deleteCommentsAlsoAtMutation) {
        toast.info('게시글은 삭제되었지만 댓글 삭제 기능은 개발 중입니다.');
      } else {
        toast.success('게시글이 삭제되었습니다.');
      }

      setIsModalOpen(false);
      setReason('');
      setDeleteCommentsAlso(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      toast.error('게시글 삭제에 실패했습니다.');
    },
  });
  // 게시글 관리 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE'
  >('HIDE');
  const [reason, setReason] = useState('');
  const [deleteCommentsAlso, setDeleteCommentsAlso] = useState(false);
  // 모달 확인 클릭
  const handleConfirmAction = () => {
    if (!reason.trim()) return;
    if (modalType === 'DELETE') {
      deleteMutation.mutate(reason);
    } else {
      // TODO: DELETE 외(RESTORE, HIDE) API 연동 시 아래 로직 구현
      toast.info('개발 중입니다');
      setIsModalOpen(false);
      setReason('');
      setDeleteCommentsAlso(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <h3 className='text-[14px] font-bold text-gray-900'>게시글 관리</h3>
      <div className='flex w-full justify-center'>
        {isDeleted ? (
          <Button
            variant='outline'
            onClick={() => {
              setModalType('RESTORE');
              setIsModalOpen(true);
            }}
            className='flex h-10 w-full items-center justify-center rounded-lg border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100'
          >
            게시글 복구
          </Button>
        ) : !isVisible ? (
          <Button
            variant='outline'
            onClick={() => {
              setModalType('SHOW');
              setIsModalOpen(true);
            }}
            className='flex h-10 w-full items-center justify-center rounded-lg border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100'
          >
            게시글 공개
          </Button>
        ) : (
          <div className='flex w-full flex-col gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setModalType('HIDE');
                setIsModalOpen(true);
              }}
              className='flex h-10 w-full items-center justify-center rounded-lg border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100'
            >
              게시글 비공개
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                setModalType('DELETE');
                setIsModalOpen(true);
              }}
              className='flex h-10 w-full items-center justify-center rounded-lg bg-red-600 text-[13px] text-white hover:bg-red-700'
            >
              게시글 삭제
            </Button>
          </div>
        )}
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
  );
}
