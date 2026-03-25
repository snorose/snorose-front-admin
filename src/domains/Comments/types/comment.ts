export interface AdminCommentListResponse {
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
  page: number;
  postId?: number;
  keyword?: string;
  isVisible?: boolean;
}

export interface AdminCommentSearchResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    totalPage: number;
    totalCount: number;
    data: AdminCommentListResponse[];
  };
}

export interface DeleteCommentResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    id: number;
    encryptedUserId: string;
    postId: number;
    content: string;
  };
}

export interface AdminCommentBulkDeleteRequest {
  commentIds: number[];
}

export interface AdminCommentBulkDeleteResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    requestedCount: number;
    deletedCount: number;
    failedCount: number;
    deletedCommentIds: number[];
    notDeletedComments: {
      commentId: number;
      reason: string;
    }[];
  };
}
