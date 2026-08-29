import type {
  CreateExamReviewPeriod,
  UpdateExamReviewPeriod,
} from '@/shared/types';
import { toTSeparatedDateTimeSeconds } from '@/shared/utils';

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
      startAt: toTSeparatedDateTimeSeconds(startAt),
      endAt: toTSeparatedDateTimeSeconds(endAt),
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
    startAt: toTSeparatedDateTimeSeconds(startAt),
    endAt: toTSeparatedDateTimeSeconds(endAt),
  };
}
