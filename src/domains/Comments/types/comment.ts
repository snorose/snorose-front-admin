import type { AdminStatus } from '@/shared/utils/postCommentUtils';

export interface AdminCommentResult {
  encryptedUserId: string;
  boardId: number;
  boardName?: string;
  commentId: number;
  postId: number;
  postTitle?: string;
  parentId: number | null;
  nickname: string;
  category?: string;
  viewCount?: number;
  likeCount?: number;
  reportCount: number;
  childCommentCount?: number;
  adminCommonStatuses?: AdminStatus[];
  isVisible: boolean;
  isKeywordExist: boolean;
  createdAt: string;
  content: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface AdminCommentSearchRequest {
  startDate?: string;
  endDate?: string;
  keywordAuthor?: string;
  searchQuery?: string;
  searchScope?: 'CONTENT' | 'COMMENT_ID' | 'PARENT_COMMENT_ID' | 'POST_ID';
  sortDirection?: 'ASC' | 'DESC';
  sortTypes?: Array<
    'LIKE_COUNT' | 'REPORT_COUNT' | 'CHILD_COMMENT_COUNT' | 'CREATED_AT'
  >;
  isKeywordExist?: boolean;
  isReported?: boolean;
  boardIds?: number[];
  adminCommonStatuses?: AdminStatus[];
}

export interface AdminCommentListResult {
  hasNext: boolean;
  totalPage?: number;
  totalCount?: number;
  data: AdminCommentResult[];
}

export interface AdminDeleteCommentResult {
  id: number;
  encryptedUserId: string;
  postId: number;
  content: string;
}

export interface AdminCommentBulkDeleteRequest {
  commentIds: number[];
  memo: string;
}

export interface AdminCommentBulkDeleteResult {
  requestedCount: number;
  deletedCount: number;
  failedCount: number;
  deletedCommentIds: number[];
  notDeletedComments: {
    commentId: number;
    memo: string;
  }[];
}

export interface AdminCommentVisibilityUpdateRequest {
  commentIds: number[];
  isVisible: boolean;
}

export interface CommentSearchParams {
  startDate?: string;
  endDate?: string;
  keywordAuthor?: string;
  searchQuery?: string;
  searchScope?: 'CONTENT' | 'COMMENT_ID' | 'PARENT_COMMENT_ID' | 'POST_ID';
  sortDirection?: 'ASC' | 'DESC';
  sortTypes?: Array<
    'CREATED_AT' | 'LIKE_COUNT' | 'REPORT_COUNT' | 'CHILD_COMMENT_COUNT'
  >;
  isKeywordExist?: boolean;
  isReported?: boolean;
  boardIds?: number[];
  adminCommonStatuses?: AdminStatus[];
}
