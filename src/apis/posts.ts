import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type {
  AdminGetPostResponse,
  AdminPostBulkDeleteResult,
  AdminPostListResult,
  AdminPostSearchRequest,
} from '@/domains/Posts/types/post';

// 게시글 조건 조회 api
export const searchPosts = async (
  page: number,
  body: AdminPostSearchRequest
): Promise<AdminPostListResult> => {
  const response = await axiosInstance.post<BaseResponse<AdminPostListResult>>(
    '/v1/admin/posts/search',
    body,
    {
      params: { page: page - 1 },
    }
  );
  return response.data.result;
};

// 게시글 단건 조회 api
export const getPost = async (
  postId: number
): Promise<AdminGetPostResponse> => {
  const response = await axiosInstance.get<BaseResponse<AdminGetPostResponse>>(
    `/v1/admin/posts/${postId}`
  );
  return response.data.result;
};

// 게시글 삭제 단건 조회 api
export const getDeletedPost = async (
  postId: number
): Promise<AdminGetPostResponse> => {
  const response = await axiosInstance.get<BaseResponse<AdminGetPostResponse>>(
    `/v1/admin/posts/deleted/${postId}`
  );
  return response.data.result;
};

// 게시글 삭제 api
export const deletePost = async (
  postId: number,
  memo: string
): Promise<AdminGetPostResponse> => {
  const response = await axiosInstance.delete<
    BaseResponse<AdminGetPostResponse>
  >(`/v1/admin/posts/${postId}`, {
    data: { memo },
  });
  return response.data.result;
};

// 게시글 복구 api
export const restorePost = async (
  postId: number
): Promise<AdminGetPostResponse> => {
  const response = await axiosInstance.patch<
    BaseResponse<AdminGetPostResponse>
  >(`/v1/admin/posts/${postId}/restore`);
  return response.data.result;
};

// 여러 게시글 선택 삭제 api
export const bulkDeletePosts = async (
  postIds: number[],
  memo: string
): Promise<AdminPostBulkDeleteResult> => {
  const response = await axiosInstance.delete<
    BaseResponse<AdminPostBulkDeleteResult>
  >('/v1/admin/posts', {
    data: { postIds, memo },
  });
  return response.data.result;
};

// 게시글 노출/숨김 일괄 업데이트 api
export const updatePostVisibility = async (
  postIds: number[],
  isVisible: boolean
): Promise<string> => {
  const response = await axiosInstance.patch<BaseResponse<string>>(
    `/v1/admin/posts/visibility`,
    {
      postIds,
      isVisible,
    }
  );
  return response.data.result;
};
