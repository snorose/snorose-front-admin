export interface AdminCommentResponse {
  encryptedUserId: string;
  boardId: number;
  commentId: number;
  postId: number;
  parentId: number | null;
  isVisible: boolean;
  isKeywordExist: boolean;
  createdAt: string;
  nickname: string;
  content: string;
  reportCount: number;
}

export interface AdminCommentSearchRequest {
  encryptedUserId?: string;
  boardId?: number;
  postId?: number;
  parentId?: number | null;
  isVisible?: boolean;
  isKeywordExist?: boolean;
  startDate?: string;
  endDate?: string;
  content?: string;
}

export interface AdminCommentListResponse {
  hasNext: boolean;
  totalPage?: number;
  totalCount?: number;
  data: AdminCommentResponse[];
}

export interface AdminDeleteCommentResponse {
  id: number;
  encryptedUserId: string;
  postId: number;
  content: string;
}

export interface AdminCommentBulkDeleteRequest {
  commentIds: number[];
}

export interface AdminCommentBulkDeleteResponse {
  requestedCount: number;
  deletedCount: number;
  failedCount: number;
  deletedCommentIds: number[];
  notDeletedComments: {
    commentId: number;
    reason: string;
  }[];
}

export interface AdminCommentVisibilityUpdateRequest {
  commentIds: number[];
  isVisible: boolean;
}
