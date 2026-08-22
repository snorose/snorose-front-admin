import { useQuery } from '@tanstack/react-query';

import { getMockExamReviewAdminStatus } from '@/domains/Reviews/mocks';

export function useExamReviewAdminStatus(
  periodId: number | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['examReviewAdminStatus', periodId],
    queryFn: () => getMockExamReviewAdminStatus(periodId as number),
    enabled: enabled && periodId !== null,
    staleTime: Infinity,
  });
}
