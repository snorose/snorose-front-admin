import type { InquiryDetail } from '@/shared/types';
import { getBoardKey } from '@/shared/utils/postCommentUtils';

const SUPPORT_FRONT_BASE_URL = import.meta.env.VITE_SUPPORT_FRONT_BASE_URL; // 문의/신고 글이 있는 서포트 프론트
const USER_FRONT_BASE_URL = import.meta.env.VITE_USER_FRONT_BASE_URL; // 신고 대상 글이 있는 유저 사이트

// 신고 여부는 group으로만 판단 (category/subGroup은 문의·신고 공용이라 제외)
export function isReportInquiry(detail: InquiryDetail): boolean {
  return detail.group === 'REPORT';
}

// 신고 → /report, 문의·기타 → /inquiry
export function buildInquiryPostUrl(detail: InquiryDetail): string {
  const path = isReportInquiry(detail) ? 'report' : 'inquiry';
  return `${SUPPORT_FRONT_BASE_URL}/${path}/${detail.inquiryId}`;
}

// 신고 대상 글 URL. 유형별로 postId 출처가 다름 (board는 targetBoardId 공통)
// POST/EXAM_REVIEW → target, COMMENT → targetPostId, USER·문의 → 없음(null)
export function buildReportTargetUrl(detail: InquiryDetail): string | null {
  if (!isReportInquiry(detail)) return null;

  let postId: number;
  switch (detail.subGroup) {
    case 'POST_REPORT':
    case 'EXAM_REVIEW_REPORT':
      postId = Number(detail.target);
      break;
    case 'COMMENT_REPORT':
      postId = detail.targetPostId;
      break;
    default:
      // USER_REPORT 등: 이동할 글 페이지 없음
      return null;
  }

  const boardKey = getBoardKey(detail.targetBoardId);

  if (!postId || !boardKey) return null;

  return `${USER_FRONT_BASE_URL}/board/${boardKey}/post/${postId}`;
}
