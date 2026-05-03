import { axiosInstance } from '@/shared/axios/instance';

import type {
  AdminCommentListResponse,
  AdminCommentResponse,
  AdminCommentSearchRequest,
} from '@/domains/Comments/types/comment';

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
    {
      params: { page },
    }
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
