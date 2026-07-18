import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restoreComment } from '@/apis';

export const useRestoreComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentIds: number[]) =>
      Promise.all(commentIds.map((commentId) => restoreComment(commentId))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['commentSearch'] });
      void queryClient.invalidateQueries({ queryKey: ['comments'] });
      void queryClient.invalidateQueries({ queryKey: ['postComments'] });
    },
    onError: (error) => {
      console.error('댓글 복구 중 오류 발생:', error);
    },
  });
};
