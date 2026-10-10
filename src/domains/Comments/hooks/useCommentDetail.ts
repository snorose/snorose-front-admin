import { useQuery } from '@tanstack/react-query';

import { getComment } from '@/apis/comments';

export function useCommentDetail(commentId: number | null) {
  return useQuery({
    queryKey: ['postComments', 'detail', commentId],
    queryFn: () => {
      if (commentId === null) throw new Error('댓글을 선택해주세요.');
      return getComment(commentId);
    },
    enabled: commentId !== null,
  });
}
