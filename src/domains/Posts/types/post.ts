export interface AdminGetPostResponse {
  postId: number;
  encryptedUserId: string;
  boardName: string;
  nickName?: string;
  category?: string;
  title: string;
  content: string;
  commentCount: number;
  viewCount: number;
  likeCount: number;
  scrapCount: number;
  reportCount: number;
  isNotice: boolean;
  isVisible: boolean;
  isEdited?: boolean;
  isKeywordExist: boolean;
  adminCommonStatuses: string[];
  createdAt: string;
}

export interface AdminPostListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    totalPage?: number;
    totalCount?: number;
    data: AdminGetPostResponse[];
  };
}

export interface AdminPostSearchRequest {
  encryptedUserId?: string;
  boardId?: number;
  isNotice?: boolean;
  isVisible?: boolean;
  isKeywordExist?: boolean;
  keywordAuthor?: string;
  keywordPost?: string;
  postSearchScope?: 'TITLE_AND_CONTENT' | 'TITLE' | 'CONTENT';
  startDate?: string;
  endDate?: string;
  sortTypes?: (
    | 'CREATED_AT'
    | 'UPDATED_AT'
    | 'REPORT_COUNT'
    | 'VIEW_COUNT'
    | 'LIKE_COUNT'
    | 'COMMENT_COUNT'
    | 'SCRAP_COUNT'
  )[];
  sortDirection?: 'ASC' | 'DESC';
  adminCommonStatuses?: string[];
  content?: string;
}

export interface DeletePostResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: AdminGetPostResponse;
}

export interface AdminPostBulkDeleteRequest {
  postIds: number[];
}

export interface AdminPostBulkDeleteResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    requestedCount: number;
    deletedCount: number;
    failedCount: number;
    deletedPostIds: number[];
    notDeletedPosts: {
      postId: number;
      reason: string;
    }[];
  };
}

export interface PostSearchParams {
  encryptedUserId?: string;
  boardId?: number;
  isNotice?: boolean;
  isVisible?: boolean;
  isKeywordExist?: boolean;
  keywordAuthor?: string;
  keywordPost?: string;
  postSearchScope?: 'TITLE_AND_CONTENT' | 'TITLE' | 'CONTENT';
  startDate?: string;
  endDate?: string;
  sortTypes?:
    | 'CREATED_AT'
    | 'UPDATED_AT'
    | 'REPORT_COUNT'
    | 'VIEW_COUNT'
    | 'LIKE_COUNT'
    | 'COMMENT_COUNT'
    | 'SCRAP_COUNT';
  sortDirection?: 'ASC' | 'DESC';
  adminCommonStatuses?: string[];
}
