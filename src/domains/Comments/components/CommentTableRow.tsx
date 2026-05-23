import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { Badge, Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { AdminCommentResponse } from '../types/comment';
import type { MemberInfo } from '@/shared/types';
import {
  formatCommentId,
  formatPostId,
  getBoardBadge,
  getCommentStatus,
  getRowStyle,
  getStatusBadgeClass,
} from '../utils/commentUtils';
import MemberInfoPopover from './MemberInfoPopover';

interface CommentTableRowProps {
  comment: AdminCommentResponse;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
  activePopoverId: number | null;
  onNicknameClick: (e: React.MouseEvent, comment: AdminCommentResponse) => void;
  popoverUser: MemberInfo | null;
  isUserLoading: boolean;
  onClosePopover: () => void;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  onSingleVisibilityToggle: (comment: AdminCommentResponse) => void;
  onFilterByPostId: (postId: number) => void;
  onFilterByParentId: (parentId: number) => void;
}

export default function CommentTableRow({
  comment,
  isSelected,
  onSelectToggle,
  activePopoverId,
  onNicknameClick,
  popoverUser,
  isUserLoading,
  onClosePopover,
  onPageChange,
  onSingleVisibilityToggle,
  onFilterByPostId,
  onFilterByParentId,
}: CommentTableRowProps) {
  const navigate = useNavigate();
  const status = getCommentStatus(comment);
  const rowStyle = getRowStyle(status);
  const board = getBoardBadge(comment.boardId);

  return (
    <Table.Row className={cn('border-b border-gray-100 last:border-0 [&_td]:h-[54px]', rowStyle)}>
      <Table.Cell className='px-3 text-center' onClick={(e) => e.stopPropagation()}>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectToggle(comment.commentId);
          }}
          className='rounded border-gray-300 cursor-pointer'
        />
      </Table.Cell>
      <Table.Cell className='px-3 font-mono text-gray-600'>
        {(() => {
          const created = formatDateTimeToMinutes(comment.createdAt);
          if (status !== '정상' && status !== '비공개해제') {
            const changeDate = formatDateTimeToMinutes(comment.updatedAt || comment.createdAt);
            return (
              <div className='flex items-center gap-1.5 leading-none flex-wrap'>
                <span>{created}</span>
                <span className='text-[11px] text-gray-400 font-medium'>({changeDate})</span>
              </div>
            );
          }
          return created;
        })()}
      </Table.Cell>
      <Table.Cell className='px-3'>
        <Badge className={board.className}>{board.name}</Badge>
      </Table.Cell>
      <Table.Cell
        className='px-3 font-bold cursor-pointer select-none relative text-gray-900'
        onClick={(e) => onNicknameClick(e, comment)}
      >
        <div className='hover:underline hover:text-blue-700 transition-colors truncate'>
          {comment.nickname || comment.userDisplay}
        </div>
        {activePopoverId === comment.commentId && (
          <MemberInfoPopover
            encryptedUserId={comment.encryptedUserId}
            popoverUser={popoverUser}
            isUserLoading={isUserLoading}
            onClose={onClosePopover}
            onPageChange={onPageChange}
          />
        )}
      </Table.Cell>
      <Table.Cell className='px-3 font-mono font-bold text-gray-800'>
        {formatCommentId(comment.commentId)}
      </Table.Cell>
      <Table.Cell
        className={cn(
          'px-3 font-mono text-gray-500 select-all',
          comment.parentId != null ? 'cursor-pointer hover:text-black transition-colors font-bold' : 'text-center'
        )}
        onDoubleClick={() => comment.parentId != null && onFilterByParentId(comment.parentId)}
      >
        {comment.parentId != null ? formatCommentId(comment.parentId) : <span className='text-gray-300'>-</span>}
      </Table.Cell>
      <Table.Cell
        className='px-3 font-mono text-gray-800 font-bold select-all cursor-pointer'
        onDoubleClick={() => onFilterByPostId(comment.postId)}
      >
        {formatPostId(comment.postId)}
      </Table.Cell>
      <Table.Cell
        className='px-3 py-1 cursor-pointer select-text'
        onDoubleClick={(e) => {
          e.stopPropagation();
          navigate(`/posts/${comment.postId}`);
        }}
      >

        <div className='flex flex-col gap-0.5 justify-center h-full'>
          <div
            className={cn('max-w-[310px] truncate text-gray-700', comment.parentId != null && 'pl-3 font-normal')}
            title={comment.content}
          >
            {comment.parentId != null && <span className='text-gray-400 mr-1'>↳</span>}
            {comment.content}
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className='px-3 text-center'>
        <Badge
          className={getStatusBadgeClass(status)}
          onClick={(e) => {
            e.stopPropagation();
            onSingleVisibilityToggle(comment);
          }}
        >
          {status}
        </Badge>
      </Table.Cell>
      <Table.Cell className='px-3 text-center'>
        {comment.isKeywordExist ? (
          <div className='flex justify-center items-center' title='의심 키워드 존재'>
            <AlertTriangle className='h-5 w-5 text-[#E65100]' />
          </div>
        ) : (
          ''
        )}
      </Table.Cell>
    </Table.Row>
  );
}


