import type {
  CreateExamReviewPeriod,
  UpdateExamReviewPeriod,
} from '@/shared/types';
import { formatDateTimeWithT } from '@/shared/utils';

interface ExamReviewPeriodFormValues {
  title: string;
  startAt: string;
  endAt: string;
}

export function createExamReviewPeriodRequest({
  title,
  startAt,
  endAt,
}: ExamReviewPeriodFormValues): CreateExamReviewPeriod {
  return [
    {
      title,
      startAt: formatDateTimeWithT(startAt),
      endAt: formatDateTimeWithT(endAt),
    },
  ];
}

export function updateExamReviewPeriodRequest({
  title,
  startAt,
  endAt,
}: ExamReviewPeriodFormValues): UpdateExamReviewPeriod {
  return {
    title,
    startAt: formatDateTimeWithT(startAt),
    endAt: formatDateTimeWithT(endAt),
  };
}
