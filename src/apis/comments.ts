import { axiosInstance } from '@/shared/axios/instance';

import type {
  AdminCommentBulkDeleteResponse,
  AdminCommentListResponse,
  AdminCommentResponse,
  AdminCommentSearchRequest,
  AdminCommentVisibilityUpdateRequest,
  AdminDeleteCommentResponse,
} from '@/domains/Comments/types/comment';

export interface PostCommentResponse {
  id: number;
  postId: number;
  encryptedUserId: string;
  userRoleId: number;
  userDisplay: string;
  isWriter: boolean;
  isWriterWithdrawn: boolean;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string | null;
  isVisible: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
  isLiked: boolean;
  children: PostCommentResponse[];
}

export interface GetPostCommentsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    data: PostCommentResponse[];
  };
}

export const getPostCommentsAPI = async (
  postId: number,
  page: number
): Promise<GetPostCommentsResponse> => {
  const response = await axiosInstance.get(`/v1/posts/${postId}/comments`, {
    params: { page },
  });
  return response.data;
};

// 댓글 상세 조회 api
export const getComment = async (
  commentId: number
): Promise<AdminCommentResponse> => {
  const response = await axiosInstance.get(`/v1/admin/comments/${commentId}`);
  return response.data.result;
};

// 대댓글 목록 조회 api
export const getCommentChildrenList = async (
  commentId: number,
  page: number
): Promise<AdminCommentListResponse> => {
  const response = await axiosInstance.get(
    `/v1/admin/comments/${commentId}/children`,
    { params: { page } }
  );
  return response.data.result;
};

// 댓글 조건 조회 api
export const searchComments = async (
  page: number,
  body: AdminCommentSearchRequest
): Promise<AdminCommentListResponse> => {
  const response = await axiosInstance.post('/v1/admin/comments/search', body, {
    params: { page },
  });
  return response.data.result;
};

// 댓글 삭제 api
export const deleteComment = async (
  commentId: number
): Promise<AdminDeleteCommentResponse> => {
  const response = await axiosInstance.delete(`/v1/admin/comments/${commentId}`);
  return response.data.result;
};

// 댓글 일괄 삭제 api
export const bulkDeleteComments = async (
  commentIds: number[]
): Promise<AdminCommentBulkDeleteResponse> => {
  const response = await axiosInstance.delete(`/v1/admin/comments`, {
    data: { commentIds },
  });
  return response.data.result;
};

// 댓글 노출/숨김 일괄 업데이트 api
export const updateCommentVisibility = async (
  body: AdminCommentVisibilityUpdateRequest
): Promise<string> => {
  const response = await axiosInstance.patch(`/v1/admin/comments/visibility`, body);
  return response.data.result;
};
