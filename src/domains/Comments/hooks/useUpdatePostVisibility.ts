import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePostVisibility } from '@/apis';

export const useUpdatePostVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postIds,
      isVisible,
    }: {
      postIds: number[];
      isVisible: boolean;
    }) => updatePostVisibility(postIds, isVisible),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('게시글 상태 변경 중 오류 발생:', error);
    },
  });
};
