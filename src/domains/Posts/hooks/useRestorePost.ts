import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restorePost } from '@/apis';

export const useRestorePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postIds: number[]) =>
      Promise.all(postIds.map((postId) => restorePost(postId))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error) => {
      console.error('게시글 복구 중 오류 발생:', error);
    },
  });
};
