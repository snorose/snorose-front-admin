import { useQuery } from '@tanstack/react-query';

import { getPost } from '@/apis';

export const usePost = (postId: number | null) => {
  const query = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId!),
    enabled: !!postId,
  });

  return {
    post: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
