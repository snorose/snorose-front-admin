import type { AdminCommentResponse } from '../types/comment';

export {
  formatCommentId,
  formatPostId,
  getBoardBadge,
  getRowStyle,
} from '@/shared/utils/postCommentUtils';

// 2. 댓글 상태 분류 헬퍼 함수
export const getCommentStatus = (comment: AdminCommentResponse): string => {
  if (comment.statusType) {
    const mapping: Record<string, string> = {
      REPORTED: '신고누적',
      DELETED: '삭제됨',
      ADMIN_DELETED: '관리자삭제',
      ADMIN_HIDDEN: '관리자비공개',
      RESTORED: '복구',
      UNHIDDEN: '비공개해제',
      NONE: '정상',
    };
    return mapping[comment.statusType] || comment.statusType;
  }

  // 폴백용 클라이언트 유추 로직
  if (comment.reportCount >= 5 && !comment.isVisible) {
    return '신고누적';
  }
  if (comment.deletedAt != null) {
    return '삭제됨';
  }
  if (!comment.isVisible) {
    return '관리자비공개';
  }
  return '정상';
};
