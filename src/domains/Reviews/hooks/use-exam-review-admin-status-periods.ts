import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ExamReviewAdminStatusPeriod,
  ExamReviewAdminStatusPeriodInput,
} from '@/domains/Reviews/types';

import {
  deleteExamReviewPeriodAPI,
  getExamReviewPeriodsAPI,
  patchExamReviewPeriodAPI,
  postExamReviewPeriodAPI,
} from '@/apis';

export const EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY = [
  'examReviewAdminStatusPeriods',
  'ADMIN_EDIT',
] as const;

export function useExamReviewAdminStatusPeriods(enabled: boolean) {
  const queryClient = useQueryClient();

  const periodsQuery = useQuery({
    queryKey: EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
    queryFn: () => getExamReviewPeriodsAPI('ADMIN_EDIT'),
    enabled,
    staleTime: 0,
  });

  const createPeriodMutation = useMutation({
    mutationFn: async (input: ExamReviewAdminStatusPeriodInput) => {
      await postExamReviewPeriodAPI([toAdminEditPeriodRequest(input)]);
      const periods = await getExamReviewPeriodsAPI('ADMIN_EDIT');
      queryClient.setQueryData(
        EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
        periods
      );
      const createdPeriod = periods.find(
        (period) => period.title === input.title
      );
      if (!createdPeriod) {
        throw new Error(
          '저장한 기간을 찾을 수 없습니다. 기간 목록을 다시 확인해주세요.'
        );
      }
      return createdPeriod;
    },
  });

  const updatePeriodMutation = useMutation({
    mutationFn: async ({
      periodId,
      input,
    }: {
      periodId: number;
      input: ExamReviewAdminStatusPeriodInput;
    }) => {
      await patchExamReviewPeriodAPI(periodId, toAdminEditPeriodRequest(input));
      const periods = await getExamReviewPeriodsAPI('ADMIN_EDIT');
      queryClient.setQueryData(
        EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
        periods
      );
      const updatedPeriod = periods.find((period) => period.id === periodId);
      if (!updatedPeriod) {
        throw new Error(
          '수정한 기간을 찾을 수 없습니다. 기간 목록을 다시 확인해주세요.'
        );
      }
      return updatedPeriod;
    },
    onSuccess: (updatedPeriod) => {
      void queryClient.invalidateQueries({
        queryKey: ['examReviewAdminStatus', updatedPeriod.id],
      });
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: async (periodId: number) => {
      await deleteExamReviewPeriodAPI(periodId, 'ADMIN_EDIT');
      return periodId;
    },
    onSuccess: (deletedPeriodId) => {
      queryClient.setQueryData<ExamReviewAdminStatusPeriod[]>(
        EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
        (currentPeriods = []) =>
          currentPeriods.filter((period) => period.id !== deletedPeriodId)
      );
      queryClient.removeQueries({
        queryKey: ['examReviewAdminStatus', deletedPeriodId],
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

function toAdminEditPeriodRequest(input: ExamReviewAdminStatusPeriodInput) {
  return {
    type: 'ADMIN_EDIT' as const,
    title: input.title,
    startAt: input.startAt,
    endAt: input.endAt,
  };
}
