import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restoreComment } from '@/apis';

import type { AdminDeleteCommentResult } from '../types/comment';

interface RestoreCommentResult {
  restored: AdminDeleteCommentResult[];
  restoredIds: number[];
  failedIds: number[];
}

export const useRestoreComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      commentIds: number[];
      memo: string;
    }): Promise<RestoreCommentResult> => {
      const results = await Promise.allSettled(
        body.commentIds.map((commentId) => restoreComment(commentId, body.memo))
      );

      const restored: AdminDeleteCommentResult[] = [];
      const restoredIds: number[] = [];
      const failedIds: number[] = [];

      results.forEach((result, index) => {
        const commentId = body.commentIds[index];

        if (result.status === 'fulfilled') {
          restored.push(result.value);
          restoredIds.push(commentId);
          return;
        }

        failedIds.push(commentId);
      });

      if (restored.length === 0 && body.commentIds.length > 0) {
        throw new Error('댓글 복구에 실패했습니다.');
      }

      return { restored, restoredIds, failedIds };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['commentStatusHistories'],
      });
      void queryClient.invalidateQueries({ queryKey: ['comments'] });
      void queryClient.invalidateQueries({ queryKey: ['postComments'] });
    },
    onError: (error) => {
      console.error('댓글 복구 중 오류 발생:', error);
    },
  });
};
