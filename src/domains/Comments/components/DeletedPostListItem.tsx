import DOMPurify from 'dompurify';

import { Badge } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { AdminGetPostResponse } from '@/domains/Comments/types';

import styles from './PostListItem.module.css';

interface DeletedPostListItemProps {
  post: AdminGetPostResponse;
  isSelected: boolean;
  onClick: (post: AdminGetPostResponse) => void;
}

export default function DeletedPostListItem({
  post,
  isSelected,
  onClick,
}: DeletedPostListItemProps) {
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
          <span className='ml-auto text-xs text-gray-400'>
            댓글 {post.commentCount}
          </span>
        </div>
        {/* 선택 시 전체 텍스트 표시, 미선택 시 한 줄로 잘림 */}
        <p
          className={cn('text-sm text-gray-700', !isSelected && 'line-clamp-1')}
        >
          {post.title}
        </p>
        {isSelected && (
          <div className='mt-1 w-full text-sm text-gray-600'>
            <div
              className={styles.postContent}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(linkifyContent(post.content), {
                  ALLOWED_TAGS: ['iframe', 'a', 'img'],
                }),
              }}
            />
            <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500'>
              <span>조회 {post.viewCount}</span>
              <span>좋아요 {post.likeCount}</span>
              <span>스크랩 {post.scrapCount}</span>
              <span>
                작성 {formatDateTimeToMinutes(post.createdAt).replace('T', ' ')}
              </span>
              {post.deletedAt && (
                <span>
                  삭제{' '}
                  {formatDateTimeToMinutes(post.deletedAt).replace('T', ' ')}
                </span>
              )}
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
