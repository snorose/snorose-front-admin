import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { AdminCommentSearchRequest } from '@/domains/Comments/types/comment';

import { searchComments } from '@/apis';

export const useCommentSearch = (
  page: number,
  body: AdminCommentSearchRequest
) => {
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);

  const query = useQuery({
    queryKey: ['commentSearch', page, body.postId, body.content, body.isVisible],
    queryFn: () => searchComments(page, body),
    enabled: !!body.postId || isSearchSubmitted,
    select: (data) => {
      if (!data || !data.data) return data;
      return {
        ...data,
        data: [...data.data].sort((a, b) => {
          const dateA = a.createdAt || '';
          const dateB = b.createdAt || '';
          return dateA.localeCompare(dateB);
        }),
      };
    },
  });

  return { ...query, setIsSearchSubmitted };
};
