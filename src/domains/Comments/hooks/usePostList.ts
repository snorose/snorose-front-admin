import { useQuery } from '@tanstack/react-query';

import { getDeletedPosts, searchPosts } from '@/apis';

interface usePostListParams {
  boardId: number | null;
}

export const usePostList = (params: usePostListParams) => {
  const { boardId } = params;

  const normalResult = useQuery({
    queryKey: ['posts', boardId],
    queryFn: () => searchPosts(0, { boardId: boardId ?? undefined }),
  });

  const deletedResult = useQuery({
    queryKey: ['deletedPosts'],
    queryFn: () => getDeletedPosts(1),
  });
  const merged = [
    ...(normalResult.data?.data ?? []),
    ...(deletedResult.data?.data ?? []),
  ];

  return {
    data: merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  };
};
