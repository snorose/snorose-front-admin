import { useQuery } from '@tanstack/react-query';

import { useStableTotalCount } from '@/shared/hooks';

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

  const totalCount = useStableTotalCount(normalResult.data?.totalCount, body);

  const sorted = normalResult.data?.data ?? [];

  return {
    data: sorted,
    isLoading: normalResult.isLoading,
    isFetching: normalResult.isFetching,
    error: normalResult.error,
    hasNext: normalResult.data?.hasNext,
    totalPage: normalResult.data?.totalPage,
    totalCount,
    refetch: normalResult.refetch,
  };
};
