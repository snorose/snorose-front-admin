import { useQuery } from '@tanstack/react-query';

import type { AdminCommentSearchRequest } from '@/domains/Comments/types/comment';

import { searchComments } from '@/apis';

export const useCommentSearch = (
  page: number,
  body: AdminCommentSearchRequest
) => {
  return useQuery({
    queryKey: ['commentSearch', page, body],
    queryFn: () => searchComments(page, body),
    enabled: !!body.postId,
    select: (data) => {
      if (!data.data) return data;
      return {
        ...data,
        data: [...data.data].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt)
        ),
      };
    },
  });
};
