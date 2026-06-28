import type {
  InquiryCategory,
  InquiryGroup,
  InquirySubGroup,
} from '@/shared/types';

export const INQUIRY_GROUP_LABELS: Record<InquiryGroup, string> = {
  INQUIRY: '문의',
  REPORT: '신고',
  ETC: '기타',
};

export const INQUIRY_SUB_GROUP_LABELS: Record<InquirySubGroup, string> = {
  EXAM_REVIEW_INQUIRY: '족보 관련 문의',
  EVENT_INQUIRY: '이벤트 관련 문의',
  NOTICE_INQUIRY: '공지 관련 문의',
  ETC_INQUIRY: '기타',
  POST_REPORT: '게시글 신고',
  EXAM_REVIEW_REPORT: '족보 신고',
  COMMENT_REPORT: '댓글 신고',
  USER_REPORT: '이용자 신고',
};

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
