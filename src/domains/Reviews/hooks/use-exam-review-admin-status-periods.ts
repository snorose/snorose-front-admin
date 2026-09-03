import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createMockExamReviewAdminStatusPeriod,
  deleteMockExamReviewAdminStatusPeriod,
  getMockExamReviewAdminStatusPeriods,
  updateMockExamReviewAdminStatusPeriod,
} from '@/domains/Reviews/mocks';
import type { ExamReviewAdminStatusPeriod } from '@/domains/Reviews/types';

export const EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY = [
  'examReviewAdminStatusPeriods',
] as const;

export function useExamReviewAdminStatusPeriods(enabled: boolean) {
  const queryClient = useQueryClient();

  const periodsQuery = useQuery({
    queryKey: EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
    queryFn: getMockExamReviewAdminStatusPeriods,
    enabled,
    staleTime: Infinity,
  });

  const createPeriodMutation = useMutation({
    mutationFn: createMockExamReviewAdminStatusPeriod,
    onSuccess: (createdPeriod) => {
      queryClient.setQueryData<ExamReviewAdminStatusPeriod[]>(
        EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
        (currentPeriods = []) => [...currentPeriods, createdPeriod]
      );
    },
  });

  const updatePeriodMutation = useMutation({
    mutationFn: updateMockExamReviewAdminStatusPeriod,
    onSuccess: (updatedPeriod) => {
      queryClient.setQueryData<ExamReviewAdminStatusPeriod[]>(
        EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
        (currentPeriods = []) =>
          currentPeriods.map((period) =>
            period.id === updatedPeriod.id ? updatedPeriod : period
          )
      );
      void queryClient.invalidateQueries({
        queryKey: ['examReviewAdminStatus', updatedPeriod.id],
      });
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: deleteMockExamReviewAdminStatusPeriod,
    onSuccess: (deletedPeriodId) => {
      queryClient.setQueryData<ExamReviewAdminStatusPeriod[]>(
        EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
        (currentPeriods = []) =>
          currentPeriods.filter((period) => period.id !== deletedPeriodId)
      );
      queryClient.removeQueries({
        queryKey: ['examReviewAdminStatus', deletedPeriodId],
        exact: true,
      });
    },
  });

  return {
    periodsQuery,
    createPeriodMutation,
    updatePeriodMutation,
    deletePeriodMutation,
    isMutating:
      createPeriodMutation.isPending ||
      updatePeriodMutation.isPending ||
      deletePeriodMutation.isPending,
  };
}
