import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bulkDeletePosts } from '@/apis';

interface BulkDeletePostVariables {
  postIds: number[];
  memo: string;
}

export const useBulkDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postIds, memo }: BulkDeletePostVariables) =>
      bulkDeletePosts(postIds, memo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('게시글 일괄 삭제 중 오류 발생:', error);
    },
  });
};
