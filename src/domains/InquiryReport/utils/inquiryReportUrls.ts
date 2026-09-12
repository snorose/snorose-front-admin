import type { InquiryDetail } from '@/shared/types';
import { getBoardKey } from '@/shared/utils';

// 문의/신고 글 위치
const USER_FRONT_BASE_URL = import.meta.env.VITE_USER_FRONT_BASE_URL;
const USER_FRONT_BOARD_BASE_URL = 'https://front.dev.snorose.com/board';
const EXAM_REVIEW_BOARD_ID = 32;

// 신고 여부는 group으로만 판단 (category/subGroup은 문의·신고 공용이라 제외)
export function isReportInquiry(detail: InquiryDetail): boolean {
  return detail.group === 'REPORT';
}

// 신고 → /report, 문의·기타 → /inquiry
export function buildInquiryPostUrl(detail: InquiryDetail): string {
  const path = isReportInquiry(detail) ? 'report' : 'inquiry';
  return `${USER_FRONT_BASE_URL}/${path}/${detail.inquiryId}`;
}

function getReportTargetPostId(detail: InquiryDetail): number | null {
  switch (detail.subGroup) {
    case 'POST_REPORT':
    case 'EXAM_REVIEW_REPORT':
      return Number(detail.target) || null;
    case 'COMMENT_REPORT':
      return detail.targetPostId || null;
    default:
      return null;
  }
}

export function hasUnmappedReportTargetBoard(
  detail: InquiryDetail
): boolean {
  return (
    isReportInquiry(detail) &&
    getReportTargetPostId(detail) !== null &&
    !getBoardKey(detail.targetBoardId)
  );
}

// 신고 대상 글 URL. 족보는 어드민 시험후기 관리로, 나머지는 사용자 프론트로 이동한다.
// 족보 신고는 targetBoardId 32로 구분한다.
export function buildReportTargetUrl(detail: InquiryDetail): string | null {
  if (!isReportInquiry(detail)) return null;

  const postId = getReportTargetPostId(detail);
  if (!postId) return null;

  if (detail.targetBoardId === EXAM_REVIEW_BOARD_ID) {
    return `/reviews/exam?keywordPost=${postId}&page=1`;
  }

  const boardKey = getBoardKey(detail.targetBoardId);

  if (!boardKey) return null;

  return `${USER_FRONT_BOARD_BASE_URL}/${boardKey}/post/${postId}`;
}
