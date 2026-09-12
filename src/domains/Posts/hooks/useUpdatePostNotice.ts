import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePostNotice } from '@/apis';

export const useUpdatePostNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postIds,
      isNotice,
    }: {
      postIds: number[];
      isNotice: boolean;
    }) => updatePostNotice(postIds, isNotice),
    onSuccess: ({ succeededPostIds }) => {
      if (succeededPostIds.length === 0) return;

      void queryClient.invalidateQueries({
        queryKey: ['posts'],
      });

      succeededPostIds.forEach((postId) => {
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      });
    },
    onError: (error) => {
      console.error('게시글 공지 상태 변경 중 오류 발생:', error);
    },
  });
};
