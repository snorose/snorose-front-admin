import { CornerDownRight, Trash2 } from 'lucide-react';

import { Badge, Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import type { AdminCommentResponse } from '@/domains/Comments/types';

interface CommentListItemProps {
  comment: AdminCommentResponse;
  isSelected: boolean;
  onSelect: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

export default function CommentListItem({
  comment,
  isSelected,
  onSelect,
  onDelete,
}: CommentListItemProps) {
  const isReply = comment.parentId !== null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3',
        isReply && 'bg-gray-50 pl-10'
      )}
    >
      {isReply && (
        <CornerDownRight className='mt-1 size-3 shrink-0 text-gray-400' />
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
          {isReply ? (
            <Badge variant='secondary' className='text-xs'>
              대댓글
            </Badge>
          ) : (
            <Badge variant='outline' className='text-xs'>
              댓글
            </Badge>
          )}
          {comment.reportCount > 0 && (
            <Badge
              variant='outline'
              className='border-red-200 bg-red-100 text-xs text-red-600'
            >
              신고 {comment.reportCount}
            </Badge>
          )}
        </div>
        <p className='text-sm text-gray-700'>{comment.content}</p>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-gray-400'>{comment.createdAt}</span>
        </div>
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='shrink-0 text-gray-400 hover:text-red-500'
        onClick={() => onDelete(comment.commentId)}
      >
        <Trash2 className='size-4' />
      </Button>
    </div>
  );
}
