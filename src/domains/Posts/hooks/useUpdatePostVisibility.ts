import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePostVisibility } from '@/apis';

export const useUpdatePostVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postIds,
      isVisible,
      memo,
    }: {
      postIds: number[];
      isVisible: boolean;
      memo: string;
    }) => updatePostVisibility(postIds, isVisible, memo),
    onSuccess: ({ succeededPostIds }) => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      succeededPostIds.forEach((postId) => {
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
        void queryClient.invalidateQueries({
          queryKey: ['postStatusHistories', postId],
        });
      });
    },
    onError: (error) => {
      console.error('게시글 상태 변경 중 오류 발생:', error);
    },
  });
};
