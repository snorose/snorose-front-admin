import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CornerDownRight,
  Eye,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

import { MemberInfoPopover } from '@/shared/components';
import StatusChangeModal from '@/shared/components/StatusChangeModal';
import { Badge, Button } from '@/shared/components/ui';
import { formatDateTimeWithAmPm } from '@/shared/utils';

import type { AdminCommentResult } from '@/domains/Comments/types';
import { getPostStatusBadges } from '@/domains/Comments/utils/commentUtils';

import { deleteComment, restoreComment, updateCommentVisibility } from '@/apis';

interface PostDetailCommentItemProps {
  comment: AdminCommentResult;
}

export default function PostDetailCommentItem({
  comment,
}: PostDetailCommentItemProps) {
  const queryClient = useQueryClient();
  const badges = getPostStatusBadges(comment);
  const statuses = comment.adminCommonStatuses ?? [];
  const isNormal = badges.length === 1 && badges[0].text === '노출';
  const isHidden =
    statuses.includes('ADMIN_HIDDEN') || statuses.includes('AUTO_HIDDEN');
  const isDeleted =
    statuses.includes('ADMIN_DELETED') || statuses.includes('USER_DELETED');
  const isSubComment = comment.parentId !== null;
  // 댓글 상태 변경 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'HIDE' | 'SHOW' | 'DELETE'>(
    'HIDE'
  );

  // 댓글 노출/숨김 변경 Mutation
  const visibilityMutation = useMutation({
    mutationFn: (isVisible: boolean) =>
      updateCommentVisibility({
        commentIds: [comment.commentId],
        isVisible,
      }),
    onSuccess: (_, isVisible) => {
      toast.success(
        isVisible ? '댓글이 공개되었습니다.' : '댓글이 비공개 처리되었습니다.'
      );
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('댓글 상태 변경에 실패했습니다.');
    },
  });

  // 댓글 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: (memo: string) => deleteComment(comment.commentId, memo),
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
      queryClient.invalidateQueries({ queryKey: ['post', comment.postId] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('댓글 삭제에 실패했습니다.');
    },
  });

  // 댓글 복구 Mutation
  const restoreMutation = useMutation({
    mutationFn: () => restoreComment(comment.commentId),
    onSuccess: () => {
      toast.success('댓글이 복구되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
      queryClient.invalidateQueries({ queryKey: ['post', comment.postId] });
    },
    onError: () => {
      toast.error('댓글 복구에 실패했습니다.');
    },
  });

  const handleConfirmAction = (memo: string) => {
    if (!memo.trim()) return;
    if (modalType === 'HIDE') visibilityMutation.mutate(false);
    else if (modalType === 'SHOW') visibilityMutation.mutate(true);
    else if (modalType === 'DELETE') deleteMutation.mutate(memo);
  };

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
            <MemberInfoPopover
              encryptedUserId={comment.encryptedUserId}
              displayName={comment.nickname}
            />
            <span className='font-mono text-xs text-gray-400'>
              {formatDateTimeWithAmPm(comment.createdAt)}
            </span>
            {comment.category && (
              <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500'>
                {comment.category}
              </span>
            )}
            {badges.length > 0 && !isNormal && (
              <div className='flex flex-wrap gap-1'>
                {badges.map((badge, idx) => (
                  <Badge
                    key={idx}
                    variant='unstyled'
                    className={badge.className}
                  >
                    {badge.text}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className='flex shrink-0 items-center gap-1.5'>
            {isNormal && (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 rounded-md border-gray-300 bg-white px-2 text-xs font-medium text-gray-600 hover:bg-gray-100'
                  onClick={(e) => {
                    e.stopPropagation();
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
                    setModalType('DELETE');
                    setIsModalOpen(true);
                  }}
                >
                  삭제
                </Button>
              </>
            )}
            {isHidden && (
              <Button
                variant='outline'
                size='sm'
                className='h-7 rounded-md border-gray-300 bg-white px-2 text-xs font-medium text-gray-600 hover:bg-gray-100'
                onClick={(e) => {
                  e.stopPropagation();
                  setModalType('SHOW');
                  setIsModalOpen(true);
                }}
              >
                공개
              </Button>
            )}
            {isDeleted && (
              <Button
                variant='outline'
                size='sm'
                className='h-7 rounded-md border-gray-300 bg-white px-2 text-xs font-medium text-gray-600 hover:bg-gray-100'
                disabled={restoreMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  restoreMutation.mutate();
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
          <span className='flex items-center gap-0.5' title='조회수'>
            <Eye className='h-3.5 w-3.5 text-gray-400' />
            {comment.viewCount ?? 0}
          </span>
          <span className='flex items-center gap-0.5' title='공감수'>
            <Heart className='h-3.5 w-3.5 fill-rose-50 text-rose-400' />
            {comment.likeCount ?? 0}
          </span>
          <span className='flex items-center gap-0.5' title='대댓글수'>
            <MessageSquare className='h-3.5 w-3.5 text-blue-400' />
            {comment.childCommentCount ?? 0}
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
      </div>
      {/* 댓글 조치 사유 기입 모달 */}
      {isModalOpen && comment && (
        <StatusChangeModal
          target='COMMENT'
          modalType={modalType}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onConfirmAction={handleConfirmAction}
        />
      )}
    </div>
  );
}
