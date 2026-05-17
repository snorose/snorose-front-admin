import { Eye, EyeOff, FileText, RotateCcw, Trash2 } from 'lucide-react';

import { Badge, Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { AdminGetPostResponse } from '@/domains/Comments/types';

interface PostListItemProps {
  post: AdminGetPostResponse;
  isSelected: boolean;
  isChecked: boolean;
  onCheck: (postId: number) => void;
  onClick: (post: AdminGetPostResponse) => void;
  onDelete: (postId: number) => void;
  onOpenModal: (post: AdminGetPostResponse) => void;
}

export default function PostListItem({
  post,
  isSelected,
  isChecked,
  onCheck,
  onClick,
  onDelete,
  onOpenModal,
}: PostListItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50',
        isSelected && 'bg-blue-50 hover:bg-blue-50',
        !post.isVisible && 'bg-yellow-50 hover:bg-yellow-50',
        post.deletedAt && 'bg-red-50 hover:bg-red-50'
      )}
    >
      <input
        type='checkbox'
        className='mt-1 cursor-pointer'
        checked={isChecked}
        onChange={() => onCheck(post.postId)}
      />
      <button
        type='button'
        onClick={() => onClick(post)}
        className='flex min-w-0 flex-1 flex-col gap-1 text-left'
      >
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{post.userDisplay}</span>
          <Badge variant='outline' className='shrink-0 text-xs'>
            {post.category}
          </Badge>
          {post.reportCount > 0 && (
            <Badge
              variant='outline'
              className='shrink-0 border-red-200 bg-red-100 text-xs text-red-600'
            >
              신고됨
            </Badge>
          )}
        </div>
        <p className='text-sm text-gray-700'>{post.title}</p>
        <div className='mt-1 w-full text-sm text-gray-600'>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500'>
            <span>
              작성 {formatDateTimeToMinutes(post.createdAt).replace('T', ' ')}
            </span>
          </div>
        </div>
      </button>
      <div className='flex shrink-0 gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-gray-400 hover:text-black'
          onClick={() => onOpenModal(post)}
        >
          <FileText className='size-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-gray-400 hover:text-blue-500'
          onClick={() => {
            // TODO: 공개/비공개 API 연동
          }}
        >
          {post.isVisible ? (
            <EyeOff className='size-4' />
          ) : (
            <Eye className='size-4' />
          )}
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-gray-400 hover:text-red-500'
          onClick={() => onDelete(post.postId)}
        >
          {post.deletedAt !== null ? (
            <RotateCcw className='size-4' />
          ) : (
            <Trash2 className='size-4' />
          )}
        </Button>
      </div>
    </div>
  );
}
