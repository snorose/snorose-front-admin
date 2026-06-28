import { MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { Button, DropdownMenu, Textarea } from '@/shared/components/ui';
import type { InquiryComment } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import { INQUIRY_COMMENT_MAX_LENGTH } from '@/domains/InquiryReport/constants/inquiryCommentValidation';
import {
  canManageComment,
  getCommentDisplayContent,
  isCommentWrittenByAdmin,
} from '@/domains/InquiryReport/utils/inquiryCommentUtils';

interface InquiryCommentItemProps {
  comment: InquiryComment;
  depth: number;
  editingCommentId: number | null;
  editingCommentValue: string;
  replyParentId: number | null;
  onEditStart: (comment: InquiryComment) => void;
  onEditCancel: () => void;
  onEditSubmit: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onReplyStart: (commentId: number) => void;
  onEditingValueChange: (value: string) => void;
}

export default function InquiryCommentItem({
  comment,
  depth,
  editingCommentId,
  editingCommentValue,
  replyParentId,
  onEditStart,
  onEditCancel,
  onEditSubmit,
  onDelete,
  onReplyStart,
  onEditingValueChange,
}: InquiryCommentItemProps) {
  const isEditing = editingCommentId === comment.id;
  const isManageable = canManageComment(comment);
  const canReply = depth === 0 && comment.isVisible && !comment.isDeleted;
  const isReplying = replyParentId === comment.id;
  const authorDisplay = comment.isWriterWithdrawn
    ? '탈퇴한 사용자'
    : comment.userDisplay;
  const isAdminComment = isCommentWrittenByAdmin(comment);
  const isEditingCommentValid =
    editingCommentValue.trim().length > 0 &&
    editingCommentValue.trim().length <= INQUIRY_COMMENT_MAX_LENGTH;

  return (
    <li className={depth > 0 ? 'ml-4 border-l-2 border-gray-100 pl-3' : ''}>
      <article
        className={`rounded-md border px-3 py-2.5 transition ${
          isReplying
            ? 'border-slate-300 bg-slate-50 shadow-[inset_3px_0_0_#64748b]'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className='mb-1 flex flex-wrap items-center justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-1.5'>
            <span className='truncate text-[12px] font-semibold text-gray-800'>
              {authorDisplay}
            </span>
            {isAdminComment && (
              <span className='rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600'>
                관리자
              </span>
            )}
            {comment.isUpdated && !comment.isDeleted && (
              <span className='text-[11px] text-gray-400'>수정됨</span>
            )}
            {!comment.isVisible && (
              <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500'>
                숨김
              </span>
            )}
            {comment.isDeleted && (
              <span className='rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-500'>
                삭제됨
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <span className='font-mono text-[11px] text-gray-400'>
              {formatDateTimeToMinutes(comment.createdAt)}
            </span>
            {isManageable && (
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <button
                    type='button'
                    className='flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600'
                    aria-label='댓글 더보기'
                  >
                    <MoreVertical className='h-4 w-4' />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align='end'>
                  <DropdownMenu.Item onClick={() => onEditStart(comment)}>
                    <Pencil className='h-4 w-4' />
                    수정
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    variant='destructive'
                    onClick={() => onDelete(comment.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                    삭제
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className='flex flex-col gap-2'>
            <Textarea
              value={editingCommentValue}
              onChange={(event) => onEditingValueChange(event.target.value)}
              maxLength={INQUIRY_COMMENT_MAX_LENGTH}
              className='min-h-20 resize-none bg-white text-[13px]'
            />
            <div className='flex items-center justify-between gap-2'>
              <span className='text-[11px] text-gray-400'>
                {editingCommentValue.length}/{INQUIRY_COMMENT_MAX_LENGTH}
              </span>
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={onEditCancel}
                >
                  취소
                </Button>
                <Button
                  type='button'
                  size='sm'
                  disabled={!isEditingCommentValid}
                  className='bg-slate-900 text-white hover:bg-slate-700'
                  onClick={() => onEditSubmit(comment.id)}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p
            className={`text-[13px] leading-relaxed whitespace-pre-wrap ${
              comment.isVisible && !comment.isDeleted
                ? 'text-gray-700'
                : 'text-gray-400'
            }`}
          >
            {getCommentDisplayContent(comment)}
          </p>
        )}

        <div className='mt-2 flex items-center justify-end'>
          {canReply && (
            <button
              type='button'
              className={`flex h-7 items-center gap-1 rounded border px-2 text-[12px] transition ${
                isReplying
                  ? 'border-slate-500 bg-slate-700 text-white'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
              }`}
              aria-label='대댓글 작성'
              onClick={() => onReplyStart(comment.id)}
            >
              <MessageSquare className='h-3.5 w-3.5' />
              {comment.children.length}
            </button>
          )}
        </div>
      </article>

      {comment.children.length > 0 && (
        <ul className='mt-2 flex flex-col gap-2'>
          {comment.children.map((childComment) => (
            <InquiryCommentItem
              key={childComment.id}
              comment={childComment}
              depth={depth + 1}
              editingCommentId={editingCommentId}
              editingCommentValue={editingCommentValue}
              replyParentId={replyParentId}
              onEditStart={onEditStart}
              onEditCancel={onEditCancel}
              onEditSubmit={onEditSubmit}
              onDelete={onDelete}
              onReplyStart={onReplyStart}
              onEditingValueChange={onEditingValueChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
