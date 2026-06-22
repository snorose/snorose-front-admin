import { useQuery } from '@tanstack/react-query';

import { searchPosts } from '@/apis';

import type { AdminPostSearchRequest } from '../types';

interface usePostListParams {
  page: number;
  body: AdminPostSearchRequest;
}

export const usePostList = (params: usePostListParams) => {
  const { page, body } = params;

  const normalResult = useQuery({
    queryKey: ['posts', page, body],
    queryFn: () => searchPosts(page, { ...body }),
  });

  const sorted = normalResult.data?.data ?? [];

  return {
    data: sorted,
    isLoading: normalResult.isLoading,
    error: normalResult.error,
    hasNext: normalResult.data?.hasNext,
    totalPage: normalResult.data?.totalPage,
    totalCount: normalResult.data?.totalCount,
    refetch: normalResult.refetch,
  };
};
