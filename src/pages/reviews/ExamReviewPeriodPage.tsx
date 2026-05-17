import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import type { ExamReviewPeriod } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  ExamReviewPeriodListSection,
  ExamReviewPeriodScheduleForm,
} from '@/domains/Reviews/components';

import { getExamReviewPeriodsAPI } from '@/apis';

export default function ExamReviewPeriodPage() {
  const [examReviewPeriods, setExamReviewPeriods] = useState<
    ExamReviewPeriod[]
  >([]);

  const isFetchingRef = useRef(false);

  const getExamReviewPeriods = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const data = await getExamReviewPeriodsAPI();
      setExamReviewPeriods(data.result as ExamReviewPeriod[]);
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '시험 후기 작성 기간 조회에 실패했습니다.')
      );
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    getExamReviewPeriods();
  }, [getExamReviewPeriods]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='시험 후기 작성 기간 관리'
        description='시험 후기 작성 기간을 생성하고 조회·수정·삭제할 수 있어요. (중간고사 직후 1주간, 기말고사 직후 3주간)'
      />

      <ExamReviewPeriodScheduleForm onSuccess={getExamReviewPeriods} />

      <ExamReviewPeriodListSection
        examReviewPeriods={examReviewPeriods}
        getExamReviewPeriods={getExamReviewPeriods}
      />
    </div>
  );
}
