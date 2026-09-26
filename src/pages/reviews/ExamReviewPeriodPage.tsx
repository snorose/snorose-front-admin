import { useQuery, useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '@/shared/components';
import { getErrorMessage } from '@/shared/utils';

import {
  ExamReviewPeriodListSection,
  ExamReviewPeriodScheduleForm,
} from '@/domains/Reviews/components';

import { getExamReviewPeriodsAPI } from '@/apis';

const EXAM_REVIEW_PERIODS_QUERY_KEY = ['examReviewPeriods'] as const;

export default function ExamReviewPeriodPage() {
  const queryClient = useQueryClient();
  const {
    data: examReviewPeriods = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: EXAM_REVIEW_PERIODS_QUERY_KEY,
    queryFn: getExamReviewPeriodsAPI,
  });
  const getExamReviewPeriods = () =>
    queryClient.invalidateQueries({ queryKey: EXAM_REVIEW_PERIODS_QUERY_KEY });

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='시험 후기 작성 기간 관리'
        description='시험 후기 작성 기간을 생성하고 조회·수정·삭제할 수 있어요. (중간고사 직후 1주간, 기말고사(+계절학기) 직후 4주간)'
      />

      <ExamReviewPeriodScheduleForm onSuccess={getExamReviewPeriods} />

      <ExamReviewPeriodListSection
        examReviewPeriods={examReviewPeriods}
        getExamReviewPeriods={getExamReviewPeriods}
        isLoading={isPending}
        isFetching={isFetching}
        errorMessage={
          error
            ? getErrorMessage(error, '시험 후기 작성 기간 조회에 실패했습니다.')
            : undefined
        }
        onRetry={() => {
          void refetch();
        }}
      />
    </div>
  );
}
