export interface AdminGetPostResponse {
  postId: number;
  encryptedUserId: string;
  boardId: number;
  userDisplay: string;
  category: string;
  title: string;
  content: string;
  commentCount: number;
  viewCount: number;
  likeCount: number;
  scrapCount: number;
  reportCount: number;
  isNotice: boolean;
  isVisible: boolean;
  isEdited: boolean;
  isKeywordExist: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminPostSearchResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    totalPage: number;
    totalCount: number;
    data: AdminGetPostResponse[];
  };
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
