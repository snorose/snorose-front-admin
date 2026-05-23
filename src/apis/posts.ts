import { axiosInstance } from '@/shared/axios/instance';

import type {
  AdminGetPostResponse,
  AdminPostBulkDeleteResponse,
  AdminPostListResponse,
  AdminPostSearchRequest,
  DeletePostResponse,
} from '@/domains/Comments/types/post';

// 게시글 조건 조회 api
export const searchPosts = async (
  page: number,
  body: AdminPostSearchRequest
): Promise<AdminPostListResponse['result']> => {
  const response = await axiosInstance.post('/v1/admin/posts/search', body, {
    params: { page: page - 1 },
  });
  return response.data.result;
};

// 게시글 단건 조회 api
export const getPost = async (
  postId: number
): Promise<AdminGetPostResponse> => {
  const response = await axiosInstance.get(`/v1/admin/posts/${postId}`);
  return response.data.result;
};

// 게시글 삭제 단건 조회 api
export const getDeletedPost = async (
  postId: number
): Promise<AdminGetPostResponse> => {
  const response = await axiosInstance.get(`/v1/admin/posts/deleted/${postId}`);
  return response.data.result;
};

// 게시글 삭제 api
export const deletePost = async (
  postId: number
): Promise<DeletePostResponse['result']> => {
  const response = await axiosInstance.delete(`/v1/admin/posts/${postId}`);
  return response.data.result;
};

// 여러 게시글 선택 삭제 api
export const bulkDeletePosts = async (
  postIds: number[]
): Promise<AdminPostBulkDeleteResponse['result']> => {
  const response = await axiosInstance.delete('/v1/admin/posts', {
    data: { postIds },
  });
  return response.data.result;
};

// 게시글 노출/숨김 일괄 업데이트 api
export const updatePostVisibility = async (
  postIds: number[],
  isVisible: boolean
): Promise<string> => {
  const response = await axiosInstance.patch(`/v1/admin/posts/visibility`, {
    postIds,
    isVisible,
  });
  return response.data.result;
};
