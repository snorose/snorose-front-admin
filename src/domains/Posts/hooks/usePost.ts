import { useQuery } from '@tanstack/react-query';

import { getDeletedPost, getPost } from '@/apis';

export const usePost = (postId: number | null) => {
  const query = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      try {
        return await getPost(postId!);
      } catch {
        return await getDeletedPost(postId!);
      }
    },
    enabled: !!postId,
  });

  return {
    post: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
