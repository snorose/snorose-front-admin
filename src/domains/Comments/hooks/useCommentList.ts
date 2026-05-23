import { useQuery } from '@tanstack/react-query';

import { searchComments } from '@/apis';

import type { AdminCommentSearchRequest } from '../types/comment';

interface UseCommentListParams {
  page: number;
  body: AdminCommentSearchRequest;
  enabled?: boolean;
}

export const useCommentList = ({
  page,
  body,
  enabled = true,
}: UseCommentListParams) => {
  return useQuery({
    queryKey: ['comments', page, body],
    queryFn: () => searchComments(page, body),
    enabled,
  });
};
