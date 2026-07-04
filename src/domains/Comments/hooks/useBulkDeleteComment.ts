import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bulkDeleteComments } from '@/apis';

interface BulkDeleteCommentVariables {
  commentIds: number[];
  memo: string;
}

export const useBulkDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentIds, memo }: BulkDeleteCommentVariables) =>
      bulkDeleteComments(commentIds, memo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentSearch'] });
    },
    onError: (error) => {
      console.error('댓글 일괄 삭제 중 오류 발생:', error);
      alert('댓글 일괄 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
};
