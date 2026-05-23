import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge, Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import type { MemberInfo } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';
import {
  getBoardBadge,
  getPostStatus,
  getRowStyle,
  getStatusBadgeClass,
} from '@/shared/utils/postCommentUtils';

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
  onSingleDelete: (postId: number) => void;
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
  onSingleDelete,
}: PostTableRowProps) {
  const navigate = useNavigate();
  const status = getPostStatus(post);
  const rowStyle = getRowStyle(status);
  const board = getBoardBadge(post.boardId);

  return (
    <Table.Row
      className={cn(
        'border-b border-gray-100 last:border-0 [&_td]:h-[54px]',
        rowStyle
      )}
    >
      {/* Checkbox */}
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

      {/* 게시일 */}
      <Table.Cell className='px-3 font-mono text-gray-600'>
        {(() => {
          const created = formatDateTimeToMinutes(post.createdAt).replace(
            'T',
            ' '
          );
          if (status !== '정상') {
            let changeDateStr = '';
            let label = '';

            if (status === '관리자삭제' && post.deletedAt) {
              changeDateStr = formatDateTimeToMinutes(post.deletedAt).replace(
                'T',
                ' '
              );
              label = '관리자 삭제';
            } else if (status === '관리자비공개' && post.updatedAt) {
              changeDateStr = formatDateTimeToMinutes(post.updatedAt).replace(
                'T',
                ' '
              );
              label = '관리자 비공개';
            } else if (status.startsWith('신고누적') && post.updatedAt) {
              changeDateStr = formatDateTimeToMinutes(post.updatedAt).replace(
                'T',
                ' '
              );
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

      {/* 게시판 */}
      <Table.Cell className='px-3'>
        <Badge className={board.className}>{board.name}</Badge>
      </Table.Cell>

      {/* 닉네임 */}
      <Table.Cell
        className='relative cursor-pointer px-3 font-bold text-gray-900 select-none'
        onClick={(e) => onNicknameClick(e, post)}
      >
        <div className='truncate transition-colors hover:text-blue-700 hover:underline'>
          {post.userDisplay || '익명송이'}
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

      {/* 제목 */}
      <Table.Cell
        className='max-w-[200px] cursor-pointer truncate px-3 py-1 font-bold text-gray-900 select-text'
        onDoubleClick={(e) => {
          e.stopPropagation();
          navigate(`/posts/${post.postId}`);
        }}
        title={post.title}
      >
        {post.title}
      </Table.Cell>

      {/* 내용 */}
      <Table.Cell
        className='max-w-[330px] cursor-pointer truncate px-3 py-1 text-gray-500 select-text'
        onDoubleClick={(e) => {
          e.stopPropagation();
          navigate(`/posts/${post.postId}`);
        }}
        title={post.content || '-'}
      >
        {post.content || '-'}
      </Table.Cell>

      {/* 상태 */}
      <Table.Cell className='px-3 text-center'>
        <Badge
          className={cn(getStatusBadgeClass(status), 'cursor-pointer')}
          onClick={(e) => {
            e.stopPropagation();
            if (status !== '관리자삭제') {
              onSingleDelete(post.postId);
            }
          }}
        >
          {status}
        </Badge>
      </Table.Cell>

      {/* 의심 키워드 */}
      <Table.Cell className='px-3 text-center'>
        {post.isKeywordExist ? (
          <Badge className='rounded border-none bg-[#F5F3FF] px-2 py-0.5 text-[11px] font-bold text-[#7C3AED] hover:bg-[#F5F3FF]'>
            포함
          </Badge>
        ) : (
          <span className='font-mono text-gray-300'>-</span>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
