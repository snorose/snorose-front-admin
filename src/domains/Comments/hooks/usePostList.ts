import { useQuery } from '@tanstack/react-query';

import { searchPosts } from '@/apis';

interface usePostListParams {
  boardId: number | null;
}

export const usePostList = (params: usePostListParams) => {
  const { boardId } = params;

  return useQuery({
    queryKey: ['posts', boardId],
    queryFn: () => searchPosts(0, { boardId: boardId ?? undefined }),
  });
};
