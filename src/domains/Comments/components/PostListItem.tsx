import { Badge } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import type { AdminGetPostResponse } from '@/domains/Comments/types';

interface PostListItemProps {
  post: AdminGetPostResponse;
  isSelected: boolean;
  onClick: (post: AdminGetPostResponse) => void;
}

export default function PostListItem({
  post,
  isSelected,
  onClick,
}: PostListItemProps) {
  return (
    <button
      type='button'
      onClick={() => onClick(post)}
      className={cn(
        'flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-gray-50',
        isSelected && 'bg-blue-50 hover:bg-blue-50'
      )}
    >
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium'>{post.userDisplay}</span>
        <Badge variant='outline' className='shrink-0 text-xs'>
          {post.category}
        </Badge>
        <span className='text-xs text-gray-500'>ID: {post.postId}</span>
        {post.reportCount > 0 && (
          <Badge variant='outline' className='shrink-0 border-red-200 bg-red-100 text-xs text-red-600'>
            신고됨
          </Badge>
        )}
      </div>
      <p className='line-clamp-1 text-sm text-gray-700'>{post.title}</p>
      <span className='text-xs text-gray-500'>댓글 {post.commentCount}</span>
    </button>
  );
}
