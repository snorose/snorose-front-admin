import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restorePost } from '@/apis';

import type { AdminGetPostResponse } from '../types/post';

interface RestorePostResult {
  restored: AdminGetPostResponse[];
  restoredIds: number[];
  failedIds: number[];
}

export const useRestorePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postIds: number[]): Promise<RestorePostResult> => {
      const results = await Promise.allSettled(
        postIds.map((postId) => restorePost(postId))
      );

      const restored: AdminGetPostResponse[] = [];
      const restoredIds: number[] = [];
      const failedIds: number[] = [];

      results.forEach((result, index) => {
        const postId = postIds[index];

        if (result.status === 'fulfilled') {
          restored.push(result.value);
          restoredIds.push(postId);
          return;
        }

        failedIds.push(postId);
      });

      if (restored.length === 0 && postIds.length > 0) {
        throw new Error('게시글 복구에 실패했습니다.');
      }

      return { restored, restoredIds, failedIds };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error) => {
      console.error('게시글 복구 중 오류 발생:', error);
    },
  });
};
