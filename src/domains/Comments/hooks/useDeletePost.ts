import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/apis';

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('게시글 삭제 중 오류 발생:', error);
    },
  });
};
