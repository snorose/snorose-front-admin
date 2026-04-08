import { Trash2 } from 'lucide-react';

import styles from './PostListItem.module.css';

import { Badge, Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import { usePost } from '@/domains/Comments/hooks/usePost';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

interface PostListItemProps {
  post: AdminGetPostResponse;
  isSelected: boolean;
  isChecked: boolean;
  onCheck: (postId: number) => void;
  onClick: (post: AdminGetPostResponse) => void;
  onDelete: (postId: number) => void;
}

export default function PostListItem({
  post,
  isSelected,
  isChecked,
  onCheck,
  onClick,
  onDelete,
}: PostListItemProps) {
  const { data: detail, isLoading } = usePost(isSelected ? post.postId : null);

  const linkifyContent = (html: string) =>
    html.replace(
      /(?<!['"=])(https?:\/\/[^\s<"']+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50',
        isSelected && 'bg-blue-50 hover:bg-blue-50'
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
          <span className='text-xs text-gray-500'>ID: {post.postId}</span>
          {post.reportCount > 0 && (
            <Badge
              variant='outline'
              className='shrink-0 border-red-200 bg-red-100 text-xs text-red-600'
            >
              신고됨
            </Badge>
          )}
          <span className='ml-auto text-xs text-gray-400'>댓글 {post.commentCount}</span>
        </div>
        {/* 선택 시 전체 텍스트 표시, 미선택 시 한 줄로 잘림 */}
        <p
          className={cn('text-sm text-gray-700', !isSelected && 'line-clamp-1')}
        >
          {post.title}
        </p>
        {isSelected && (
          <div className='mt-1 w-full text-sm text-gray-600'>
            {isLoading ? (
              <span className='text-xs text-gray-400'>불러오는 중...</span>
            ) : (
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: linkifyContent(detail?.content ?? '') }}
              />
            )}
          </div>
        )}
      </button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='shrink-0 text-gray-400 hover:text-red-500'
        onClick={() => onDelete(post.postId)}
      >
        <Trash2 className='size-4' />
      </Button>
    </div>
  );
}
