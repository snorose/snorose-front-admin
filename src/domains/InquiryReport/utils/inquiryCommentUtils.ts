import type { InquiryComment } from '@/shared/types';

export function canManageComment(comment: InquiryComment) {
  return Boolean(comment.isWriter && comment.isVisible && !comment.isDeleted);
}

export function getCommentAuthorDisplay(comment: InquiryComment) {
  return comment.isWriterWithdrawn ? '탈퇴한 사용자' : comment.userDisplay;
}

export function isCommentWrittenByAdmin(comment: InquiryComment) {
  return comment.isWriter;
}

export function getCommentDisplayContent(comment: InquiryComment) {
  if (comment.isDeleted) return '삭제된 댓글입니다.';
  if (!comment.isVisible) return '숨김 처리된 댓글입니다.';
  return comment.content;
}

export function countComments(comments: InquiryComment[]): number {
  return comments.reduce(
    (count, comment) => count + 1 + countComments(comment.children),
    0
  );
}

export function findComment(
  comments: InquiryComment[],
  commentId: number
): InquiryComment | null {
  for (const comment of comments) {
    if (comment.id === commentId) return comment;

    const childComment = findComment(comment.children, commentId);
    if (childComment) return childComment;
  }

  return null;
}
