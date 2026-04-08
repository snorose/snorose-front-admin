import { axiosInstance } from '@/shared/axios/instance';

import type {
  AdminGetPostResponse,
  AdminPostSearchRequest,
} from '@/domains/Comments/types/post';

// 삭제된 게시글 목록 조회 api
export const getDeletedPosts = async (
  page: number
): Promise<AdminGetPostResponse[]> => {
  const response = await axiosInstance.get('/v1/admin/posts/deleted', {
    params: { page },
  });
  return response.data.result.data;
};

// 게시글 조건 조회 api
export const searchPosts = async (
  page: number,
  body: AdminPostSearchRequest
): Promise<AdminGetPostResponse[]> => {
  const response = await axiosInstance.post('/v1/admin/posts/search', body, {
    params: { page },
  });
  return response.data.result.data;
};
