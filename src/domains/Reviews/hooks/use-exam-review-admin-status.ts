import { useQuery } from '@tanstack/react-query';

import { getMockExamReviewAdminStatus } from '@/domains/Reviews/mocks';
import type { ExamReviewAdminStatusPeriod } from '@/domains/Reviews/types';

export function useExamReviewAdminStatus(
  period: ExamReviewAdminStatusPeriod | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: [
      'examReviewAdminStatus',
      period?.id,
      period?.startAt,
      period?.endAt,
    ],
    queryFn: () => {
      if (!period) throw new Error('현황을 조회할 기간을 찾을 수 없습니다.');
      return getMockExamReviewAdminStatus(period);
    },
    enabled: enabled && Boolean(period),
    staleTime: Infinity,
  });
}
