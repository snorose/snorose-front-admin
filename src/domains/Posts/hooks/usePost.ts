import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPost } from '@/apis';

import type { AdminGetPostResponse } from '../types';

export const usePost = (postId: number | null) => {
  const queryClient = useQueryClient();
  const queryKey = ['post', postId] as const;
  const cachedPost = queryClient.getQueryData<AdminGetPostResponse>(queryKey);
  const isDeleted = cachedPost?.adminCommonStatuses.some(
    (status) => status === 'ADMIN_DELETED' || status === 'USER_DELETED'
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getPost(postId!),
    enabled: !!postId,
    staleTime: isDeleted ? Infinity : undefined,
    gcTime: isDeleted ? Infinity : undefined,
  });

  return {
    post: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
