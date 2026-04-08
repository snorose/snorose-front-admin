import { useQuery } from '@tanstack/react-query';

import { getPosts } from '@/apis';

export const usePost = (postId: number | null) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPosts(postId!),
    enabled: !!postId,
  });
};
