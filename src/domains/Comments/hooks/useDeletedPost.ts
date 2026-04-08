import { useQuery } from '@tanstack/react-query';

import { getDeletedPost } from '@/apis';

export const useDeletedPost = (postId: number | null) => {
  return useQuery({
    queryKey: ['deletedPost', postId],
    queryFn: () => getDeletedPost(postId!),
    enabled: !!postId,
  });
};
