import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AdminInquiryCommentCreateRequest } from '@/shared/types';

import { INQUIRY_COMMENT_MAX_LENGTH } from '@/domains/InquiryReport/constants/inquiryCommentValidation';

import { createInquiryCommentAPI } from '@/apis/inquiries';

export const useCreateInquiryComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdminInquiryCommentCreateRequest) => {
      const content = data.content.trim();
      if (!content) throw new Error('내용을 입력하세요.');
      if (content.length > INQUIRY_COMMENT_MAX_LENGTH) {
        throw new Error(
          `댓글은 ${INQUIRY_COMMENT_MAX_LENGTH}자까지 입력할 수 있습니다.`
        );
      }

      return await createInquiryCommentAPI(postId, {
        ...data,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiryComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['inquiryDetail', postId] });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : '댓글 등록에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
    },
  });
};
