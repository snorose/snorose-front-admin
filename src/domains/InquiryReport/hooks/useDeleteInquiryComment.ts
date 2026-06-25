import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteInquiryCommentAPI } from '@/apis/inquiries';

export const useDeleteInquiryComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      return await deleteInquiryCommentAPI(postId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiryComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['inquiryDetail', postId] });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : '댓글 삭제에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
    },
  });
};
