import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { ExamReviewAdminStatusPeriod } from '@/domains/Reviews/types';

import { getExamReviewAdminStatus } from '@/apis';

import { EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY } from './exam-review-query-keys';

export function useExamReviewAdminStatus(
  period: ExamReviewAdminStatusPeriod | undefined,
  enabled: boolean
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    return () => {
      // 캐시는 유지하고, 모달을 다시 열 때 최신 통계를 조회한다.
      void queryClient.invalidateQueries({
        queryKey: EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY,
        refetchType: 'none',
      });
    };
  }, [enabled, queryClient]);

  return useQuery({
    queryKey: [
      ...EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY,
      period?.id,
      period?.startAt,
      period?.endAt,
    ],
    queryFn: () => {
      if (!period) throw new Error('현황을 조회할 기간을 찾을 수 없습니다.');
      return getExamReviewAdminStatus(period.id);
    },
    enabled: enabled && Boolean(period),
    staleTime: 30_000,
  });
}
