import { useQuery, useQueryClient } from '@tanstack/react-query';

import { NoticePanel, PageHeader } from '@/shared/components';
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
        description='시험 후기 작성 기간을 생성하고 조회·수정·삭제할 수 있어요.'
      />

      <NoticePanel
        items={[
          <>
            <strong>시험 후기 작성 기간:</strong> 중간고사·기말고사·계절학기
            종료 후 각각 1주 (한 학기에 총 3회)
          </>,
          <>
            <strong>최종 업데이트:</strong> 2026년 9월 27일 운영관리 16차 회의
            내용 반영{' '}
            <a
              href='https://app.notion.com/p/snorose/2026-16-3e07ef0aa3bf80368d24dd92846c3fcc?source=copy_link#3e87ef0aa3bf808d87dbcb90f1508482'
              target='_blank'
              rel='noopener noreferrer'
              className='underline! decoration-dotted underline-offset-4'
            >
              (회의록 링크)
            </a>
          </>,
        ]}
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
