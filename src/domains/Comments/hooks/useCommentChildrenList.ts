import { useQuery } from '@tanstack/react-query';

import { getCommentChildrenList } from '@/apis';

export const useCommentChildrenList = (commentId: number, page: number) => {
  return useQuery({
    queryKey: ['commentChildren', commentId, page],
    queryFn: () => getCommentChildrenList(commentId, page),
    enabled: !!commentId,
  });
};
