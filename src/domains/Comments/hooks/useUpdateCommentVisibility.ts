import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AdminCommentVisibilityUpdateRequest } from '@/domains/Comments/types/comment';

import { updateCommentVisibility } from '@/apis';

export const useUpdateCommentVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdminCommentVisibilityUpdateRequest) =>
      updateCommentVisibility(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentSearch'] });
    },
    onError: (error) => {
      console.error('댓글 가시성 업데이트 중 오류 발생:', error);
      alert('댓글 가시성 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
};
