/** 어드민 공지 목록·작성 및 수정 API 문서 기준. */
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

export interface UpdateNoticeAttachmentRequest
  extends CreateNoticeAttachmentRequest {
  id: number | null;
}

/** 미전달 필드는 기존 값을 유지하며, images: []는 기존 첨부 전체 삭제입니다. */
export interface AdminUpdateNoticeRequest {
  boardId?: number;
  category?: string;
  title?: string;
  content?: string;
  images?: UpdateNoticeAttachmentRequest[];
  isVisible?: boolean;
  scheduledAt?: string;
}

export interface AdminUpdateNoticeResult {
  postId: number;
  imageUploadUrls: string[];
  status: AdminNoticeStatus;
  scheduledAt: string | null;
}

/** 저장이 반영됐거나 결과가 불명확하면 같은 편집 화면에서 다시 전송하지 않습니다. */
export interface NoticeSaveProgress {
  createOutcomeUnknown?: boolean;
  result?: AdminCreateNoticeResult;
  updateOutcomeUnknown?: boolean;
  updateResult?: AdminUpdateNoticeResult;
}
