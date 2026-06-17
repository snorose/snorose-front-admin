import type { AdminCommentResponse } from '../types/comment';

export {
  BOARD_NAMES,
  formatCommentId,
  formatPostId,
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

// 3. 댓글 상태 배지 (getPostStatusBadges와 동일한 패턴)
const BASE = 'border-none font-bold text-[11px] px-2 py-0.5 rounded';

const COMMENT_STATUS_BADGE: Record<
  string,
  { text: string; className: string }
> = {
  신고누적: {
    text: '신고누적',
    className: `bg-[#FEF9C3] text-[#A16207] hover:bg-[#FEF9C3] ${BASE}`,
  },
  관리자비공개: {
    text: '관리자비공개',
    className: `bg-[#FFEDD5] text-[#374151] hover:bg-[#FFEDD5] ${BASE}`,
  },
  관리자삭제: {
    text: '관리자삭제',
    className: `bg-[#F3F4F6] text-[#DC2626] hover:bg-[#F3F4F6] ${BASE}`,
  },
  삭제됨: {
    text: '삭제됨',
    className: `bg-[#1F2937] text-white hover:bg-[#1F2937] ${BASE}`,
  },
  복구: {
    text: '복구',
    className: `bg-[#EBF7EE] text-[#047857] hover:bg-[#EBF7EE] ${BASE}`,
  },
  비공개해제: {
    text: '비공개해제',
    className: `bg-[#EBF7EE] text-[#047857] hover:bg-[#EBF7EE] ${BASE}`,
  },
};

const COMMENT_STATUS_DEFAULT = {
  text: '정상',
  className: `bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6] ${BASE}`,
};

export const getCommentStatusBadge = (status: string) =>
  COMMENT_STATUS_BADGE[status] ?? COMMENT_STATUS_DEFAULT;
