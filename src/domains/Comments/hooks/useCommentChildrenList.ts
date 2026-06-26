import { useQuery } from '@tanstack/react-query';

import { getCommentChildrenList } from '@/apis';

interface UseCommentChildrenListParams {
  commentId: number | null;
  page: number;
  enabled?: boolean;
}

export const useCommentChildrenList = ({
  commentId,
  page,
  enabled = true,
}: UseCommentChildrenListParams) => {
  return useQuery({
    queryKey: ['comments', commentId, 'children', page],
    queryFn: () => getCommentChildrenList(commentId!, page - 1),
    enabled: enabled && commentId !== null,
  });
};
