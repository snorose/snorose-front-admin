/** 첨부한 어드민 공지 목록 조회/작성 API 문서(2026-11-04) 기준. */
export type AdminNoticeStatus = 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'PRIVATE';

export interface AdminNoticeListItem {
  postId: number;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  adminNickname: string;
  viewCount: number;
  likeCount: number;
  scrapCount: number;
  status: AdminNoticeStatus;
  isNew: boolean;
  isPinned: boolean;
  updatedAt: string;
}

export interface AdminNoticeListResult {
  hasNext: boolean;
  totalPage: number;
  totalCount: number;
  currentCount: number;
  data: AdminNoticeListItem[];
}

export interface CreateNoticeAttachmentRequest {
  type: 'PHOTO' | 'VIDEO';
  fileName: string;
  fileComment: string;
}

export interface AdminCreateNoticeRequest {
  boardId: number;
  category?: string;
  title: string;
  content: string;
  images: CreateNoticeAttachmentRequest[];
  isDraft: boolean;
  isScheduled: boolean;
  scheduledAt: string | null;
}

export interface AdminCreateNoticeResult {
  postId: number;
  imageUploadUrls: string[];
  isDraft: boolean;
  isScheduled: boolean;
  scheduledAt: string | null;
}

/** 한 작성 화면의 재시도 상태. 생성 성공·결과 불명일 때 POST를 반복하지 않습니다. */
export interface NoticeSaveProgress {
  createOutcomeUnknown?: boolean;
  result?: AdminCreateNoticeResult;
  request?: AdminCreateNoticeRequest;
  uploaded: Set<number>;
  thumbnailReady: boolean;
}
