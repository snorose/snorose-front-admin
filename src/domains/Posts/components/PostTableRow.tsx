import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bookmark,
  Eye,
  Heart,
  MessageSquare,
} from 'lucide-react';

import { MemberInfoPopover, StatusBadge } from '@/shared/components';
import { Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import {
  formatDateTimeWithAmPm,
  formatPostId,
  getPostStatusBadges,
  stripHtmlTags,
} from '@/shared/utils';

import type { AdminGetPostResponse } from '../types/post';

interface PostTableRowProps {
  post: AdminGetPostResponse;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
}

export default function PostTableRow({
  post,
  isSelected,
  onSelectToggle,
}: PostTableRowProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleOpenDetail = () => {
    queryClient.setQueryData(['post', post.postId], post);
    navigate(`/posts/manage/${post.postId}`);
  };

  return (
    <Table.Row
      className={cn('border-b border-gray-100 last:border-0 [&_td]:h-[54px]')}
    >
      {/* 0. Checkbox */}
      <Table.Cell className='px-3 text-center'>
        <label className='inline-flex cursor-pointer p-2'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelectToggle(post.postId);
            }}
            className='cursor-pointer rounded border-gray-300'
          />
        </label>
      </Table.Cell>

      {/* 1. 게시글 ID */}
      <Table.Cell className='px-3 font-mono text-xs text-gray-500'>
        {formatPostId(post.postId)}
      </Table.Cell>

      {/* 2. 제목/내용 미리보기 */}
      <Table.Cell
        className='cursor-pointer px-3 py-2 select-text'
        onClick={(e) => {
          e.stopPropagation();
          handleOpenDetail();
        }}
      >
        <div className='flex max-w-[380px] flex-col gap-1'>
          <div className='flex items-center gap-1.5'>
            {post.isNotice && <StatusBadge tone='info'>공지</StatusBadge>}
            <span
              className='block truncate font-bold text-gray-900'
              title={post.title}
            >
              {post.title}
            </span>
          </div>
          <span
            className='block truncate text-xs text-gray-500'
            title={post.content || '-'}
          >
            {stripHtmlTags(post.content)}
          </span>
        </div>
      </Table.Cell>

      {/* 3. 작성자(닉네임) */}
      <Table.Cell className='relative cursor-pointer px-3 font-bold text-gray-900'>
        <MemberInfoPopover
          encryptedUserId={post.encryptedUserId}
          displayName={post.nickName ?? '정보 없음'}
        />
      </Table.Cell>

      {/* 4. 게시판 */}
      <Table.Cell className='px-3'>
        <StatusBadge tone='outline'>{post.boardName}</StatusBadge>
      </Table.Cell>

      {/* 5. 상태 */}
      <Table.Cell className='px-3 text-center'>
        <div className='flex flex-wrap items-center justify-center gap-1'>
          {getPostStatusBadges(post).map((badge, idx) => {
            return (
              <StatusBadge key={idx} tone={badge.tone}>
                {badge.label}
              </StatusBadge>
            );
          })}
        </div>
      </Table.Cell>

      {/* 6. 작성일 */}
      <Table.Cell className='px-3 font-mono text-xs text-gray-600'>
        {formatDateTimeWithAmPm(post.createdAt)}
      </Table.Cell>

      {/* 7. 카테고리 */}
      <Table.Cell className='px-3 text-xs text-gray-500'>
        {post.category ? (
          <StatusBadge tone='outline'>{post.category}</StatusBadge>
        ) : (
          <span className='font-mono text-gray-300'>-</span>
        )}
      </Table.Cell>

      {/* 8. 통계 */}
      <Table.Cell className='px-3 py-1.5 text-center'>
        <div className='mx-auto grid max-w-[110px] grid-cols-3 justify-items-start gap-x-2 gap-y-1 pl-1 font-mono text-[11px] text-gray-500'>
          <span className='flex items-center gap-0.5' title='조회수'>
            <Eye className='h-3.5 w-3.5 text-gray-400' />
            {post.viewCount}
          </span>
          <span className='flex items-center gap-0.5' title='공감수'>
            <Heart className='h-3.5 w-3.5 fill-rose-50 text-rose-400' />
            {post.likeCount}
          </span>
          <span className='flex items-center gap-0.5' title='댓글수'>
            <MessageSquare className='h-3.5 w-3.5 text-blue-400' />
            {post.commentCount}
          </span>
          <span className='flex items-center gap-0.5' title='스크랩수'>
            <Bookmark className='h-3.5 w-3.5 fill-amber-50 text-amber-400' />
            {post.scrapCount}
          </span>
          <span
            className={cn(
              'col-span-2 flex items-center gap-0.5',
              post.reportCount > 0 && 'font-bold text-red-600'
            )}
            title='신고수'
          >
            <AlertTriangle
              className={cn(
                'h-3.5 w-3.5',
                post.reportCount > 0 ? 'text-red-500' : 'text-gray-400'
              )}
            />
            {post.reportCount}
          </span>
        </div>
      </Table.Cell>

      {/* 9. 의심 키워드 */}
      <Table.Cell className='px-3 text-center'>
        {post.isKeywordExist ? (
          <StatusBadge tone='warning'>Y</StatusBadge>
        ) : (
          <StatusBadge tone='neutral'>N</StatusBadge>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
