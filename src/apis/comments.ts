import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type {
  AdminCommentBulkDeleteResult,
  AdminCommentListResult,
  AdminCommentResult,
  AdminCommentSearchRequest,
  AdminCommentVisibilityUpdateRequest,
  AdminDeleteCommentResult,
} from '@/domains/Comments/types/comment';

export interface PostCommentResult {
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
  children: PostCommentResult[];
}

export const getPostCommentsAPI = async (
  postId: number,
  page: number
): Promise<{ hasNext: boolean; data: PostCommentResult[] }> => {
  const response = await axiosInstance.get<
    BaseResponse<{ hasNext: boolean; data: PostCommentResult[] }>
  >(`/v1/posts/${postId}/comments`, { params: { page } });
  return response.data.result;
};

// 댓글 상세 조회 api
export const getComment = async (
  commentId: number
): Promise<AdminCommentResult> => {
  const response = await axiosInstance.get<BaseResponse<AdminCommentResult>>(
    `/v1/admin/comments/${commentId}`
  );
  return response.data.result;
};

// 대댓글 목록 조회 api
export const getCommentChildrenList = async (
  commentId: number,
  page: number
): Promise<AdminCommentListResult> => {
  const response = await axiosInstance.get<
    BaseResponse<AdminCommentListResult>
  >(`/v1/admin/comments/${commentId}/children`, { params: { page } });
  return response.data.result;
};

// 댓글 조건 조회 api
export const searchComments = async (
  page: number,
  body: AdminCommentSearchRequest
): Promise<AdminCommentListResult> => {
  const response = await axiosInstance.post<
    BaseResponse<AdminCommentListResult>
  >('/v1/admin/comments/search', body, {
    params: { page: page - 1 },
  });
  return response.data.result;
};

// 댓글 삭제 api
export const deleteComment = async (
  commentId: number
): Promise<AdminDeleteCommentResult> => {
  const response = await axiosInstance.delete<
    BaseResponse<AdminDeleteCommentResult>
  >(`/v1/admin/comments/${commentId}`);
  return response.data.result;
};

// 댓글 일괄 삭제 api
export const bulkDeleteComments = async (
  commentIds: number[]
): Promise<AdminCommentBulkDeleteResult> => {
  const response = await axiosInstance.delete<
    BaseResponse<AdminCommentBulkDeleteResult>
  >(`/v1/admin/comments`, {
    data: { commentIds },
  });
  return response.data.result;
};

// 댓글 노출/숨김 일괄 업데이트 api
export const updateCommentVisibility = async (
  body: AdminCommentVisibilityUpdateRequest
): Promise<string> => {
  const response = await axiosInstance.patch<BaseResponse<string>>(
    `/v1/admin/comments/visibility`,
    body
  );
  return response.data.result;
};
