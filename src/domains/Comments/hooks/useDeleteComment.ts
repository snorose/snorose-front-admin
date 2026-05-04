import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteComment } from '@/apis';

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentSearch'] });
    },
    onError: (error) => {
      console.error('댓글 삭제 중 오류 발생:', error);
      alert('댓글 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
};
