import { PATHS } from '@/shared/constants';
import type { InquiryDetail } from '@/shared/types';

import {
  buildCommentDetailUrl,
  parseCommentId,
} from '@/domains/Comments/utils/commentUrls';

const EXAM_REVIEW_BOARD_ID = 32;

// 문의·신고의 원문은 스노로즈 사용자 사이트에서 연다.
export function buildOriginalInquiryPostUrl(detail: InquiryDetail): string {
  const path = detail.group === 'REPORT' ? 'report' : 'inquiry';
  return `${import.meta.env.VITE_USER_FRONT_BASE_URL}/${path}/${detail.inquiryId}`;
}

export function parseInquiryPostId(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// 신고 대상을 어드민 게시글·댓글 상세 또는 시험후기 관리로 연결한다.
export function buildReportTargetUrl(detail: InquiryDetail): string | null {
  if (detail.group !== 'REPORT') return null;

  if (detail.subGroup === 'COMMENT_REPORT') {
    const commentId = parseCommentId(detail.target ?? '');
    if (commentId === null) return null;

    const postId = detail.targetPostId;
    return buildCommentDetailUrl(
      commentId,
      Number.isSafeInteger(postId) && postId > 0 ? postId : undefined
    );
  }

  if (
    detail.subGroup !== 'POST_REPORT' &&
    detail.subGroup !== 'EXAM_REVIEW_REPORT'
  ) {
    return null;
  }

  const postId = Number(detail.target);
  if (!Number.isSafeInteger(postId) || postId <= 0) return null;

  if (detail.targetBoardId === EXAM_REVIEW_BOARD_ID) {
    return `${PATHS.REVIEW_EXAM}?keywordPost=${postId}&page=1`;
  }

  return `${PATHS.POST_MANAGE}/${postId}`;
}
