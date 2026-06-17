import { useQuery } from '@tanstack/react-query';

import { getDeletedPost, getPost } from '@/apis';

export const usePost = (postId: number | null, deletedAt: string | null) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => (deletedAt ? getDeletedPost(postId!) : getPost(postId!)),
    enabled: !!postId,
  });
};
