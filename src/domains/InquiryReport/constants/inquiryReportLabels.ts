import type { StatusBadgeTone } from '@/shared/components';
import type {
  InquiryCategory,
  InquiryGroup,
  InquiryStatus,
  InquirySubGroup,
} from '@/shared/types';

export type InquiryBadgeMeta = {
  label: string;
  tone: StatusBadgeTone;
};

export const INQUIRY_GROUP_BADGE_META: Record<InquiryGroup, InquiryBadgeMeta> =
  {
    INQUIRY: { label: '문의', tone: 'info' },
    REPORT: { label: '신고', tone: 'danger' },
    ETC: { label: '기타', tone: 'neutral' },
  };

export const INQUIRY_SUB_GROUP_BADGE_META: Record<
  InquirySubGroup,
  InquiryBadgeMeta
> = {
  EXAM_REVIEW_INQUIRY: { label: '족보 관련 문의', tone: 'info' },
  EVENT_INQUIRY: { label: '이벤트 관련 문의', tone: 'info' },
  NOTICE_INQUIRY: { label: '공지 관련 문의', tone: 'info' },
  ETC_INQUIRY: { label: '기타', tone: 'info' },
  POST_REPORT: { label: '게시글 신고', tone: 'danger' },
  EXAM_REVIEW_REPORT: { label: '족보 신고', tone: 'danger' },
  COMMENT_REPORT: { label: '댓글 신고', tone: 'danger' },
  USER_REPORT: { label: '이용자 신고', tone: 'danger' },
};

export const INQUIRY_STATUS_BADGE_META: Record<
  InquiryStatus,
  InquiryBadgeMeta
> = {
  PENDING: { label: '답변 전', tone: 'neutral' },
  COMPLETED: { label: '답변 완료', tone: 'success' },
  HOLD: { label: '보류', tone: 'warning' },
};

export const INQUIRY_AUXILIARY_BADGE_META = {
  WITHDRAWN: { label: '탈퇴', tone: 'neutral' },
  EDITED: { label: '수정됨', tone: 'neutral' },
  COMMENT_HIDDEN: { label: '숨김', tone: 'warning' },
  COMMENT_DELETED: { label: '삭제됨', tone: 'danger' },
  COMMENT_ADMIN: { label: '관리자', tone: 'accent' },
} as const satisfies Record<string, InquiryBadgeMeta>;

const UNKNOWN_BADGE_META: InquiryBadgeMeta = {
  label: '알 수 없음',
  tone: 'neutral',
};

export function getInquiryGroupBadgeMeta(group: string): InquiryBadgeMeta {
  return INQUIRY_GROUP_BADGE_META[group as InquiryGroup] ?? UNKNOWN_BADGE_META;
}

export function getInquirySubGroupBadgeMeta(
  subGroup: string
): InquiryBadgeMeta {
  return (
    INQUIRY_SUB_GROUP_BADGE_META[subGroup as InquirySubGroup] ??
    UNKNOWN_BADGE_META
  );
}

export function getInquiryStatusBadgeMeta(status: string): InquiryBadgeMeta {
  return (
    INQUIRY_STATUS_BADGE_META[status as InquiryStatus] ?? UNKNOWN_BADGE_META
  );
}

export const INQUIRY_REPORT_CAUSE_LABELS: Record<InquiryCategory, string> = {
  // 문의
  EXAM_REVIEW_INQUIRY: '족보 관련 문의',
  EVENT_INQUIRY: '이벤트 관련 문의',
  NOTICE_INQUIRY: '공지 관련 문의',
  ETC_INQUIRY: '기타 문의',

  // 게시글 신고
  POST_INSULT_OR_DEFAMATION: '욕설/비방',
  POST_COMMERCIAL_ADVERTISEMENT: '상업적 광고',
  POST_ILLEGAL_CONTENT: '불법 콘텐츠',
  POST_PERSONAL_DATA_LEAK: '개인정보 노출',
  POST_AGITATION_OR_DISPUTE: '선동/분쟁',
  POST_OBSCENE_OR_IMMORAL: '음란/불건전',
  POST_LOW_QUALITY: '저품질',
  POST_OFFENSIVE_CONTENT: '불쾌한 내용',
  POST_ETC: '기타',

  // 족보 신고
  EXAM_FALSE_REVIEW: '허위 후기',
  EXAM_COMMERCIAL_SELLING: '상업적 판매',
  EXAM_ETC: '기타',

  // 댓글 신고
  COMMENT_INSULT_OR_DEFAMATION: '욕설/비방',
  COMMENT_COMMERCIAL_ADVERTISEMENT: '상업적 광고',
  COMMENT_AGITATION_OR_DISPUTE: '선동/분쟁',
  COMMENT_PERSONAL_DATA_LEAK: '개인정보 노출',
  COMMENT_OBSCENE_OR_IMMORAL: '음란/불건전',
  COMMENT_LOW_QUALITY: '저품질',
  COMMENT_ETC: '기타',

  // 이용자 신고
  USER_IMPERSONATION: '사칭',
  USER_FRAUD: '사기',
  USER_OUTSIDER: '외부인',
  USER_HARASSMENT: '괴롭힘',
  USER_ETC: '기타',
};
