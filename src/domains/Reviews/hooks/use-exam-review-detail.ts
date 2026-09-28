import { useQuery } from '@tanstack/react-query';

import { getExamReviewDetail } from '@/apis';

import { examReviewDetailQueryKey } from './exam-review-query-keys';

export function useExamReviewDetail(postId: number | null) {
  return useQuery({
    queryKey: examReviewDetailQueryKey(postId),
    queryFn: () => {
      if (postId === null) throw new Error('시험 후기를 선택해주세요.');
      return getExamReviewDetail(postId);
    },
    enabled: postId !== null,
  });
}
