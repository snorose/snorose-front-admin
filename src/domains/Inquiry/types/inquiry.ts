export type InquiryCategory = '문의' | '신고';

export type InquirySubCategory =
  | '족보 관련 문의'
  | '기타 문의'
  | '족보 신고'
  | '게시글 신고'
  | '댓글 신고'
  | '유저 신고';

export type InquiryStatus = '접수' | '진행중' | '진행완료' | '보류';

export type InquiryAction = '경고' | '게시글 삭제' | '계정 제재';

export interface InquiryAttachment {
  name: string;
  url: string;
}

export interface Inquiry {
  id: number;
  category: InquiryCategory;
  subCategory: InquirySubCategory;
  userId: string; // 예: 'noonsong(59360000)'
  userName: string; // 예: '김눈송'
  status: InquiryStatus;
  title: string;
  contentPreview: string; // 본문 앞 30자
  content: string; // 전체 본문
  attachments: InquiryAttachment[];
  reportedLink?: string; // 신고 시 첨부 링크
  assignee?: string; // 담당자
  adminReply?: string; // 관리자 답변 (있으면 수정/삭제 불가)
  action?: InquiryAction; // 신고 처리 조치
  createdAt: string; // ISO 날짜
  updatedAt: string;
}

// 목록 필터 파라미터
export interface InquiryListParams {
  keyword?: string;
  category?: InquiryCategory;
  subCategory?: InquirySubCategory;
  status?: InquiryStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

// 답변 작성/수정 요청
export interface InquiryReplyRequest {
  id: number;
  adminReply: string;
  action?: InquiryAction;
}

// 카테고리 수정 요청
export interface InquiryCategoryUpdateRequest {
  id: number;
  category: InquiryCategory;
  subCategory: InquirySubCategory;
}

// 담당자 지정 요청
export interface InquiryAssignRequest {
  id: number;
  assignee: string;
}

// 분류별 중분류 맵
export const SUB_CATEGORY_MAP: Record<InquiryCategory, InquirySubCategory[]> = {
  문의: ['족보 관련 문의', '기타 문의'],
  신고: ['족보 신고', '게시글 신고', '댓글 신고', '유저 신고'],
};

// 신고 유형별 링크 필드 레이블
export const REPORT_LINK_LABEL: Partial<Record<InquirySubCategory, string>> = {
  '족보 신고': '족보 링크',
  '게시글 신고': '게시글 링크',
  '댓글 신고': '댓글 링크',
  '유저 신고': '유저 아이디',
};

// FAQ 타입
export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqUpsertRequest {
  id?: number;
  question: string;
  answer: string;
  category: string;
}
