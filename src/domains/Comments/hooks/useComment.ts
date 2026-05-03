import { useQuery } from '@tanstack/react-query';

import { getComment } from '@/apis';

export const useComment = (commentId: number) => {
  return useQuery({
    queryKey: ['comment', commentId],
    queryFn: () => getComment(commentId),
    enabled: !!commentId,
  });
};
