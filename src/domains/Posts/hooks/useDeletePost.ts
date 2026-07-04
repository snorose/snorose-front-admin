import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/apis';

interface DeletePostVariables {
  postId: number;
  memo: string;
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, memo }: DeletePostVariables) =>
      deletePost(postId, memo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('게시글 삭제 중 오류 발생:', error);
    },
  });
};
