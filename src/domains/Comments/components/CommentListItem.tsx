import { CornerDownRight, Eye, EyeOff, Trash2 } from 'lucide-react';

import { Badge, Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { AdminCommentResponse } from '@/domains/Comments/types';

interface CommentListItemProps {
  comment: AdminCommentResponse;
  isSelected: boolean;
  onSelect: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onToggleVisibility: (commentId: number, currentVisible: boolean) => void;
}

export default function CommentListItem({
  comment,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
}: CommentListItemProps) {
  const isReply = comment.parentId !== null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3',
        isReply && 'bg-gray-50 pl-10',
        !comment.isVisible && 'opacity-60'
      )}
    >
      {isReply && (
        <CornerDownRight className='mt-1 size-4 shrink-0 text-gray-400' />
      )}
      <input
        type='checkbox'
        className='mt-1 cursor-pointer'
        checked={isSelected}
        onChange={() => onSelect(comment.commentId)}
      />
      <div className='flex flex-1 flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-400'>ID: {comment.commentId}</span>
          <span className='text-sm font-medium'>{comment.nickname}</span>

          {comment.reportCount > 0 && (
            <Badge
              variant='outline'
              className='border-red-200 bg-red-100 text-xs text-red-600'
            >
              신고 {comment.reportCount}
            </Badge>
          )}
          {!comment.isVisible && (
            <Badge variant='outline' className='bg-gray-100 text-xs text-gray-500'>
              비공개
            </Badge>
          )}
        </div>
        <p className='text-sm text-gray-700'>{comment.content}</p>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-gray-400'>
            {formatDateTimeToMinutes(comment.createdAt).replace('T', ' ')}
          </span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className={cn(
            'text-gray-400 hover:text-blue-500',
            !comment.isVisible && 'text-blue-500'
          )}
          onClick={() => onToggleVisibility(comment.commentId, comment.isVisible)}
          title={comment.isVisible ? '비공개로 전환' : '공개로 전환'}
        >
          {comment.isVisible ? (
            <Eye className='size-4' />
          ) : (
            <EyeOff className='size-4' />
          )}
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-gray-400 hover:text-red-500'
          onClick={() => onDelete(comment.commentId)}
        >
          <Trash2 className='size-4' />
        </Button>
      </div>
    </div>
  );
}
