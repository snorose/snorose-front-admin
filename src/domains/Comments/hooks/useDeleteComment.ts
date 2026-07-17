import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteComment } from '@/apis';

interface DeleteCommentVariables {
  commentId: number;
  memo: string;
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, memo }: DeleteCommentVariables) =>
      deleteComment(commentId, memo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentSearch'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error) => {
      console.error('댓글 삭제 중 오류 발생:', error);
      alert('댓글 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
};
