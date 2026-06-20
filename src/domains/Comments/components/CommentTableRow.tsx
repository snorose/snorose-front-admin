import { useNavigate } from 'react-router-dom';

import { AlertTriangle, Heart } from 'lucide-react';

import MemberInfoPopover from '@/shared/components/MemberInfoPopover';
import { Badge, Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateTimeWithAmPm } from '@/shared/utils';

import type { AdminCommentResponse } from '../types/comment';
import {
  BOARD_NAMES,
  formatCommentId,
  formatPostId,
  getCommentStatus,
  getCommentStatusBadge,
} from '../utils/commentUtils';

interface CommentTableRowProps {
  comment: AdminCommentResponse;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
  onSingleVisibilityToggle: (comment: AdminCommentResponse) => void;
  onFilterByPostId: (postId: number) => void;
  onFilterByParentId: (parentId: number) => void;
}

export default function CommentTableRow({
  comment,
  isSelected,
  onSelectToggle,
  onSingleVisibilityToggle,
  onFilterByPostId,
  onFilterByParentId,
}: CommentTableRowProps) {
  const navigate = useNavigate();
  const status = getCommentStatus(comment);

  return (
    <Table.Row className='border-b border-gray-100 bg-white text-gray-800 last:border-0 hover:bg-gray-50/50 [&_td]:h-[54px]'>
      {/* 1. 체크박스 */}
      <Table.Cell
        className='px-3 text-center'
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type='checkbox'
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectToggle(comment.commentId);
          }}
          className='cursor-pointer rounded border-gray-300'
        />
      </Table.Cell>

      {/* 2. 댓글 ID */}
      <Table.Cell className='px-3 font-mono text-xs text-gray-500'>
        {formatCommentId(comment.commentId)}
      </Table.Cell>

      {/* 3. 게시글 ID */}
      <Table.Cell
        className='cursor-pointer px-3 font-mono text-xs font-bold text-gray-500 transition-colors hover:text-black'
        onDoubleClick={(e) => {
          e.stopPropagation();
          onFilterByPostId(comment.postId);
        }}
      >
        {formatPostId(comment.postId)}
      </Table.Cell>

      {/* 4. 상위 댓글 ID */}
      <Table.Cell
        className={cn(
          'px-3 font-mono text-xs text-gray-500 select-all',
          comment.parentId != null
            ? 'cursor-pointer font-bold transition-colors hover:text-black'
            : 'text-center'
        )}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (comment.parentId != null) {
            onFilterByParentId(comment.parentId);
          }
        }}
      >
        {comment.parentId != null ? (
          formatCommentId(comment.parentId)
        ) : (
          <span className='text-gray-300'>-</span>
        )}
      </Table.Cell>

      {/* 5. 제목/내용 미리보기 */}
      <Table.Cell
        className='cursor-pointer px-3 py-2 select-text'
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/posts/manage/${comment.postId}`, {
            state: { from: 'comments' },
          });
        }}
      >
        <div className='flex max-w-[380px] flex-col gap-1'>
          <span
            className='block truncate font-bold text-gray-900'
            title={comment.postTitle || comment.title || ''}
          >
            {comment.postTitle || comment.title || '제목 없음'}
          </span>
          <span
            className='block truncate text-xs text-gray-500'
            title={comment.content}
          >
            {comment.parentId != null && (
              <span className='mr-1 text-gray-400'>↳</span>
            )}
            {comment.content}
          </span>
        </div>
      </Table.Cell>

      {/* 6. 작성자(닉네임) */}
      <Table.Cell className='relative cursor-pointer px-3 font-bold text-gray-900 select-none'>
        <MemberInfoPopover
          encryptedUserId={comment.encryptedUserId}
          displayName={comment.nickname ?? '정보 없음'}
        />
      </Table.Cell>

      {/* 7. 게시판 */}
      <Table.Cell className='px-3'>
        <Badge variant='unstyled'>{BOARD_NAMES[comment.boardId] ?? '-'}</Badge>
      </Table.Cell>

      {/* 8. 카테고리 */}
      <Table.Cell className='px-3 text-xs text-gray-500'>
        {comment.category ? (
          <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600'>
            {comment.category}
          </span>
        ) : (
          <span className='font-mono text-gray-300'>-</span>
        )}
      </Table.Cell>

      {/* 9. 통계 */}
      <Table.Cell className='px-3 py-1.5 text-center'>
        <div className='mx-auto flex max-w-[110px] justify-center gap-x-3 font-mono text-[11px] text-gray-500'>
          <span className='flex items-center gap-0.5' title='공감수'>
            <Heart className='h-3.5 w-3.5 fill-rose-50 text-rose-400' />
            {comment.likeCount ?? 0}
          </span>
          <span
            className={cn(
              'flex items-center gap-0.5',
              comment.reportCount > 0 && 'font-bold text-red-600'
            )}
            title='신고수'
          >
            <AlertTriangle
              className={cn(
                'h-3.5 w-3.5',
                comment.reportCount > 0 ? 'text-red-500' : 'text-gray-400'
              )}
            />
            {comment.reportCount}
          </span>
        </div>
      </Table.Cell>

      {/* 10. 의심 키워드 */}
      <Table.Cell className='px-3 text-center'>
        {comment.isKeywordExist ? (
          <Badge className='rounded border-none bg-[#F5F3FF] px-2 py-0.5 text-[11px] font-bold text-[#7C3AED] hover:bg-[#F5F3FF]'>
            Y
          </Badge>
        ) : (
          <Badge className='rounded border-none bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-bold text-[#9CA3AF] hover:bg-[#F3F4F6]'>
            N
          </Badge>
        )}
      </Table.Cell>

      {/* 11. 상태 */}
      <Table.Cell className='px-3 text-center'>
        <Badge
          variant='unstyled'
          className={cn(
            getCommentStatusBadge(status).className,
            'cursor-pointer hover:opacity-80'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSingleVisibilityToggle(comment);
          }}
        >
          {status}
        </Badge>
      </Table.Cell>

      {/* 12. 작성일 */}
      <Table.Cell className='px-3 font-mono text-xs text-gray-600'>
        {(() => {
          const created = formatDateTimeWithAmPm(comment.createdAt);
          if (status !== '정상' && status !== '비공개해제') {
            let changeDateStr = '';
            let label = '';

            if (status === '관리자삭제' && comment.deletedAt) {
              changeDateStr = formatDateTimeWithAmPm(comment.deletedAt);
              label = '관리자 삭제';
            } else if (status === '관리자비공개' && comment.updatedAt) {
              changeDateStr = formatDateTimeWithAmPm(comment.updatedAt);
              label = '관리자 비공개';
            } else if (status === '삭제됨' && comment.deletedAt) {
              changeDateStr = formatDateTimeWithAmPm(comment.deletedAt);
              label = '삭제됨';
            } else if (status.startsWith('신고누적') && comment.updatedAt) {
              changeDateStr = formatDateTimeWithAmPm(comment.updatedAt);
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
