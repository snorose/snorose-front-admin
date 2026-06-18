import { useQuery } from '@tanstack/react-query';

import { getDeletedPost, getPost } from '@/apis';

export const usePost = (postId: number | null, deletedAt?: string | null) => {
  const firstQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => (deletedAt ? getDeletedPost(postId!) : getPost(postId!)),
    enabled: !!postId,
    retry: deletedAt === undefined ? false : undefined,
  });

  const secondQuery = useQuery({
    enabled: !!postId && !!firstQuery.error && deletedAt === undefined,
    queryKey: ['deletedPost', postId],
    queryFn: () => getDeletedPost(postId!),
  });

  return {
    post: firstQuery.data ?? secondQuery.data,
    isLoading: firstQuery.isLoading || secondQuery.isLoading,
    error: deletedAt === undefined ? secondQuery.error : firstQuery.error,
    refetch: () => {
      firstQuery.refetch();
      secondQuery.refetch();
    },
  };
};
