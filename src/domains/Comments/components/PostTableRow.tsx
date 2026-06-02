import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertTriangle,
  Bookmark,
  Eye,
  Heart,
  MessageSquare,
} from 'lucide-react';

import { Badge, Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import type { MemberInfo } from '@/shared/types';
import { formatDateTimeWithAmPm } from '@/shared/utils';
import {
  formatPostId,
  getBoardBadge,
  getPostStatus,
  getPostStatusBadges,
} from '@/shared/utils/postCommentUtils';
import { stripHtmlTags } from '@/shared/utils/postCommentUtils';

import type { AdminGetPostResponse } from '../types/post';
import MemberInfoPopover from './MemberInfoPopover';

interface PostTableRowProps {
  post: AdminGetPostResponse;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
  activePopoverId: number | null;
  onNicknameClick: (e: React.MouseEvent, post: AdminGetPostResponse) => void;
  popoverUser: MemberInfo | null;
  isUserLoading: boolean;
  onClosePopover: () => void;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export default function PostTableRow({
  post,
  isSelected,
  onSelectToggle,
  activePopoverId,
  onNicknameClick,
  popoverUser,
  isUserLoading,
  onClosePopover,
  onPageChange,
}: PostTableRowProps) {
  const navigate = useNavigate();
  const status = getPostStatus(post);
  const board = getBoardBadge(post.boardId);

  return (
    <Table.Row
      className={cn('border-b border-gray-100 last:border-0 [&_td]:h-[54px]')}
    >
      {/* 0. Checkbox */}
      <Table.Cell
        className='px-3 text-center'
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type='checkbox'
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectToggle(post.postId);
          }}
          className='cursor-pointer rounded border-gray-300'
        />
      </Table.Cell>

      {/* 1. 게시글 ID */}
      <Table.Cell className='px-3 font-mono text-xs text-gray-500'>
        {formatPostId(post.postId)}
      </Table.Cell>

      {/* 2. 제목/내용 미리보기 */}
      <Table.Cell
        className='cursor-pointer px-3 py-2 select-text'
        onDoubleClick={(e) => {
          e.stopPropagation();
          navigate(`/posts/${post.postId}`);
        }}
      >
        <div className='flex max-w-[380px] flex-col gap-1'>
          <div className='flex items-center gap-1.5'>
            {post.isNotice && (
              <Badge className='rounded border-none bg-[#FEE2E2] px-1.5 py-0.5 text-[10px] font-bold text-[#991B1B] hover:bg-[#FEE2E2]'>
                공지
              </Badge>
            )}
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
      <Table.Cell
        className='relative cursor-pointer px-3 font-bold text-gray-900 select-none'
        onClick={(e) => onNicknameClick(e, post)}
      >
        <div className='truncate transition-colors hover:text-blue-700 hover:underline'>
          {post.nickName || '익명송이'}
        </div>
        {activePopoverId === post.postId && (
          <MemberInfoPopover
            encryptedUserId={post.encryptedUserId}
            popoverUser={popoverUser}
            isUserLoading={isUserLoading}
            onClose={onClosePopover}
            onPageChange={onPageChange}
          />
        )}
      </Table.Cell>

      {/* 4. 게시판 */}
      <Table.Cell className='px-3'>
        <span className={board.className}>{post.boardName || board.name}</span>
      </Table.Cell>

      {/* 5. 카테고리 */}
      <Table.Cell className='px-3 text-xs text-gray-500'>
        {post.category ? (
          <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600'>
            {post.category}
          </span>
        ) : (
          <span className='font-mono text-gray-300'>-</span>
        )}
      </Table.Cell>

      {/* 6. 통계 */}
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

      {/* 7. 의심 키워드 */}
      <Table.Cell className='px-3 text-center'>
        {post.isKeywordExist ? (
          <Badge className='rounded border-none bg-[#F5F3FF] px-2 py-0.5 text-[11px] font-bold text-[#7C3AED] hover:bg-[#F5F3FF]'>
            Y
          </Badge>
        ) : (
          <Badge className='rounded border-none bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-bold text-[#9CA3AF] hover:bg-[#F3F4F6]'>
            N
          </Badge>
        )}
      </Table.Cell>

      {/* 8. 상태 */}
      <Table.Cell className='px-3 text-center'>
        <div className='flex flex-wrap items-center justify-center gap-1'>
          {getPostStatusBadges(post).map((badge, idx) => {
            return (
              <Badge key={idx} className={badge.className}>
                {badge.text}
              </Badge>
            );
          })}
        </div>
      </Table.Cell>

      {/* 9. 작성일 */}
      <Table.Cell className='px-3 font-mono text-xs text-gray-600'>
        {(() => {
          const created = formatDateTimeWithAmPm(post.createdAt);
          if (status !== '정상') {
            let changeDateStr = '';
            let label = '';

            if (status === '관리자삭제' && post.deletedAt) {
              changeDateStr = formatDateTimeWithAmPm(post.deletedAt);
              label = '관리자 삭제';
            } else if (status === '관리자비공개' && post.updatedAt) {
              changeDateStr = formatDateTimeWithAmPm(post.updatedAt);
              label = '관리자 비공개';
            } else if (status.startsWith('신고누적') && post.updatedAt) {
              changeDateStr = formatDateTimeWithAmPm(post.updatedAt);
              label = '신고누적';
            }

            if (changeDateStr) {
              return (
                <div className='flex flex-col leading-tight'>
                  <span className='font-semibold'>{created}</span>
                  <span className='text-[10px] font-medium text-gray-400'>
                    ({label}: {changeDateStr})
                  </span>
                </div>
              );
            }
          }
          return created;
        })()}
      </Table.Cell>
    </Table.Row>
  );
}
