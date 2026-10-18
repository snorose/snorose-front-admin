import { useEffect, useState } from 'react';

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

import { EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY } from './exam-review-query-keys';

export const EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY = [
  'examReviewAdminStatusPeriods',
  'ADMIN_EDIT',
] as const;

export function useExamReviewAdminStatusPeriods(enabled: boolean) {
  const queryClient = useQueryClient();
  const [hasSavedPeriodRefreshError, setHasSavedPeriodRefreshError] =
    useState(false);

  const periodsQuery = useQuery({
    queryKey: EXAM_REVIEW_ADMIN_STATUS_PERIODS_QUERY_KEY,
    queryFn: () => getExamReviewPeriodsAPI('ADMIN_EDIT'),
    enabled,
    staleTime: 0,
  });

  useEffect(() => {
    if (hasSavedPeriodRefreshError && (!enabled || periodsQuery.isSuccess)) {
      setHasSavedPeriodRefreshError(false);
    }
  }, [enabled, periodsQuery.isSuccess, hasSavedPeriodRefreshError]);

  const refreshPeriodsAfterSave = async () => {
    // 저장이 끝난 뒤의 조회 오류는 목록에서 처리하고 저장 실패로 전파하지 않는다.
    const result = await periodsQuery.refetch({ throwOnError: false });
    setHasSavedPeriodRefreshError(result.isError);
    return result.isError ? undefined : result.data;
  };

  const createPeriodMutation = useMutation({
    mutationFn: async (input: ExamReviewAdminStatusPeriodInput) => {
      await postExamReviewPeriodAPI([toAdminEditPeriodRequest(input)]);
      const periods = await refreshPeriodsAfterSave();
      return periods?.find((period) => period.title === input.title);
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
      const periods = await refreshPeriodsAfterSave();
      return periods?.find((period) => period.id === periodId);
    },
    onSuccess: (_updatedPeriod, { periodId }) => {
      void queryClient.invalidateQueries({
        queryKey: [...EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY, periodId],
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
        queryKey: [...EXAM_REVIEW_ADMIN_STATUS_QUERY_KEY, deletedPeriodId],
      });
    },
  });

  return {
    periodsQuery,
    createPeriodMutation,
    updatePeriodMutation,
    deletePeriodMutation,
    hasSavedPeriodRefreshError,
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
