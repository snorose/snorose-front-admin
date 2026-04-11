import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { searchPosts } from '@/apis';

interface usePostListParams {
  boardId: number | null;
}

export const usePostList = (params: usePostListParams) => {
  const { boardId } = params;

  const normalResult = useQuery({
    queryKey: ['posts', boardId],
    queryFn: () => searchPosts(0, { boardId: boardId ?? undefined }),
  });

  const sorted = useMemo(() => {
    return [...(normalResult.data?.data ?? [])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [normalResult.data]);

  return {
    data: sorted,
    isLoading: normalResult.isLoading,
    error: normalResult.error,
  };
};
