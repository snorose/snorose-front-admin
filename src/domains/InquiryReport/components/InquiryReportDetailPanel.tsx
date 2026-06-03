import { type FormEvent, useEffect, useState } from 'react';

import { ExternalLink, Send, X } from 'lucide-react';

import { Button, Textarea } from '@/shared/components/ui';
import type { InquiryComment, InquiryStatus } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  INQUIRY_GROUP_LABELS,
  INQUIRY_REPORT_CAUSE_LABELS,
  INQUIRY_SUB_GROUP_LABELS,
} from '@/domains/InquiryReport/constants/inquiryReportLabels';

import {
  INQUIRY_COMMENT_MOCK_DATA,
  INQUIRY_DETAIL_MOCK_DATA,
} from '@/__mocks__';

import {
  canManageComment,
  countComments,
  createMockAdminComment,
  findComment,
  getCommentAuthorDisplay,
  updateCommentTree,
} from '../utils/inquiryCommentUtils';
import InquiryCommentItem from './InquiryCommentItem';
import InquiryReportAttachmentItem from './InquiryReportAttachmentItem';
import InquiryStatusSelect from './InquiryStatusSelect';

interface InquiryReportDetailPanelProps {
  postId: number;
  onClose: () => void;
  status: InquiryStatus;
  onStatusChange: (
    inquiryId: number,
    status: InquiryStatus
  ) => void | Promise<void>;
}

export default function InquiryReportDetailPanel({
  postId,
  onClose,
  status,
  onStatusChange,
}: InquiryReportDetailPanelProps) {
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<InquiryComment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentValue, setEditingCommentValue] = useState('');
  const [replyParentId, setReplyParentId] = useState<number | null>(null);
  const detail = INQUIRY_DETAIL_MOCK_DATA[postId];

  useEffect(() => {
    setComments(INQUIRY_COMMENT_MOCK_DATA[postId] ?? []);
    setCommentInput('');
    setEditingCommentId(null);
    setEditingCommentValue('');
    setReplyParentId(null);
  }, [postId]);

  if (!detail) {
    return (
      <div className='flex h-40 w-full items-center justify-center overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm'>
        <p className='text-sm text-gray-400'>해당 항목을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentStatus = status ?? detail.status;
  const commentCount = countComments(comments);
  const replyParentComment = replyParentId
    ? findComment(comments, replyParentId)
    : null;

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedComment = commentInput.trim();
    if (!trimmedComment) return;

    const newComment = createMockAdminComment(postId, trimmedComment);

    if (replyParentId) {
      setComments((prev) =>
        updateCommentTree(prev, replyParentId, (comment) => ({
          ...comment,
          children: [...comment.children, newComment],
        }))
      );
      setReplyParentId(null);
    } else {
      setComments((prev) => [...prev, newComment]);
    }

    setCommentInput('');
  };

  const handleReplyStart = (commentId: number) => {
    setReplyParentId((prev) => (prev === commentId ? null : commentId));
  };

  const handleReplyCancel = () => {
    setReplyParentId(null);
  };

  const handleCommentEditStart = (comment: InquiryComment) => {
    if (!canManageComment(comment)) return;

    setEditingCommentId(comment.id);
    setEditingCommentValue(comment.content);
  };

  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentValue('');
  };

  const handleCommentEditSubmit = (commentId: number) => {
    const editingComment = findComment(comments, commentId);
    if (!editingComment || !canManageComment(editingComment)) return;

    const trimmedComment = editingCommentValue.trim();
    if (!trimmedComment) return;

    setComments((prev) =>
      updateCommentTree(prev, commentId, (comment) => ({
        ...comment,
        content: trimmedComment,
        updatedAt: new Date().toISOString(),
        isUpdated: true,
      }))
    );
    handleCommentEditCancel();
  };

  const handleCommentDelete = (commentId: number) => {
    const targetComment = findComment(comments, commentId);
    if (!targetComment || !canManageComment(targetComment)) return;

    setComments((prev) =>
      updateCommentTree(prev, commentId, (comment) => ({
        ...comment,
        content: '',
        updatedAt: new Date().toISOString(),
        isDeleted: true,
      }))
    );

    handleCommentEditCancel();
  };

  return (
    <div className='max-h-[calc(100vh-180px)] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm'>
      {/* 헤더 */}
      <div className='flex items-start justify-between gap-2 border-b border-gray-100 px-4 py-3'>
        <p
          className='flex-1 truncate text-sm font-semibold text-gray-900'
          title={detail.title}
        >
          {detail.title}
        </p>
        <div className='flex shrink-0 items-center gap-2'>
          <InquiryStatusSelect
            inquiryId={postId}
            status={currentStatus}
            title={detail.title}
            onStatusChange={onStatusChange}
          />
          {detail.link && (
            <a
              href={detail.link}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='해당 글 바로가기'
              title='해당 글 바로가기'
              className='flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white !text-slate-600 shadow-xs transition hover:border-slate-300 hover:bg-slate-50'
            >
              <ExternalLink className='h-4 w-4 shrink-0' />
            </a>
          )}
          <button
            onClick={onClose}
            className='flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            aria-label='닫기'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className='grid grid-cols-1 gap-x-8 gap-y-2 border-b border-gray-100 px-4 py-3 text-[13px] sm:grid-cols-2'>
        <div className='flex min-w-0 flex-col gap-2'>
          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>분류</span>
            <span className='min-w-0 break-words text-gray-800'>
              {INQUIRY_GROUP_LABELS[detail.group] ?? detail.group}
            </span>
          </div>

          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>중분류</span>
            <span className='min-w-0 break-words text-gray-800'>
              {INQUIRY_SUB_GROUP_LABELS[detail.subGroup] ?? detail.subGroup}
            </span>
          </div>

          {detail.reportCause && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>신고 사유</span>
              <span className='min-w-0 break-words text-gray-800'>
                {INQUIRY_REPORT_CAUSE_LABELS[detail.reportCause] ??
                  detail.reportCause}
              </span>
            </div>
          )}

          {detail.target && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>신고 대상</span>
              <span className='min-w-0 break-words text-gray-800'>
                {detail.target}
              </span>
            </div>
          )}
        </div>

        <div className='flex min-w-0 flex-col gap-2'>
          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>작성자</span>
            <span className='min-w-0 break-words text-gray-800'>
              {detail.isWriterWithdrawn ? '탈퇴한 사용자' : detail.userDisplay}
            </span>
          </div>

          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>작성일</span>
            <span className='min-w-0 break-words text-gray-800'>
              {formatDateTimeToMinutes(detail.createdAt)}
            </span>
          </div>

          {detail.updatedAt && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>수정일</span>
              <span className='min-w-0 break-words text-gray-800'>
                {formatDateTimeToMinutes(detail.updatedAt)}
              </span>
            </div>
          )}

          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>답변</span>
            <span className='min-w-0 break-words text-gray-800'>
              {commentCount}건
            </span>
          </div>

          {detail.isEdited && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>수정 여부</span>
              <span className='min-w-0 break-words text-gray-800'>수정됨</span>
            </div>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className='flex flex-col gap-2 border-b border-gray-100 px-4 py-3'>
        <p className='text-[13px] font-medium text-gray-700'>내용</p>
        <div className='rounded border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-gray-800'>
          {detail.content}
        </div>
      </div>

      {/* 댓글 */}
      <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3'>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-[13px] font-medium text-gray-700'>댓글</p>
          <span className='text-[12px] text-gray-400'>{commentCount}건</span>
        </div>

        {comments.length > 0 ? (
          <ul className='flex flex-col gap-2'>
            {comments.map((comment) => (
              <InquiryCommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                editingCommentId={editingCommentId}
                editingCommentValue={editingCommentValue}
                replyParentId={replyParentId}
                onEditStart={handleCommentEditStart}
                onEditCancel={handleCommentEditCancel}
                onEditSubmit={handleCommentEditSubmit}
                onDelete={handleCommentDelete}
                onReplyStart={handleReplyStart}
                onEditingValueChange={setEditingCommentValue}
              />
            ))}
          </ul>
        ) : (
          <div className='rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[13px] text-gray-400'>
            등록된 댓글이 없습니다.
          </div>
        )}

        <form className='flex flex-col gap-2' onSubmit={handleCommentSubmit}>
          {replyParentComment && (
            <div className='flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600'>
              <span className='min-w-0 truncate'>
                {getCommentAuthorDisplay(replyParentComment)} 댓글에 대댓글 작성
              </span>
              <button
                type='button'
                className='shrink-0 text-slate-400 hover:text-slate-700'
                onClick={handleReplyCancel}
              >
                취소
              </button>
            </div>
          )}
          <Textarea
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            placeholder={
              replyParentComment
                ? '대댓글을 입력하세요.'
                : '관리자 댓글을 입력하세요.'
            }
            className='min-h-24 resize-none bg-white text-[13px]'
          />
          <div className='flex justify-end'>
            <Button
              type='submit'
              size='sm'
              disabled={!commentInput.trim()}
              className='bg-slate-900 text-white hover:bg-slate-700'
            >
              <Send className='h-3.5 w-3.5' />
              {replyParentComment ? '대댓글 등록' : '댓글 등록'}
            </Button>
          </div>
        </form>
      </div>

      {/* 첨부파일 */}
      {detail.attachments.length > 0 && (
        <div className='flex flex-col gap-2 px-4 py-3'>
          <p className='text-[13px] font-medium text-gray-700'>첨부파일</p>
          <ul className='flex flex-col gap-2'>
            {detail.attachments.map((attachment) => (
              <InquiryReportAttachmentItem
                key={attachment.id}
                attachment={attachment}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
