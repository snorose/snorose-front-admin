import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { INQUIRY_COMMENT_MAX_LENGTH } from '@/domains/InquiryReport/constants/inquiryCommentValidation';

import { updateInquiryCommentAPI } from '@/apis/inquiries';

export const useUpdateInquiryComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) throw new Error('내용을 입력하세요.');
      if (trimmedContent.length > INQUIRY_COMMENT_MAX_LENGTH) {
        throw new Error(
          `댓글은 ${INQUIRY_COMMENT_MAX_LENGTH}자까지 입력할 수 있습니다.`
        );
      }

      return await updateInquiryCommentAPI(postId, commentId, {
        content: trimmedContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiryComments', postId] });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : '댓글 수정에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
    },
  });
};
