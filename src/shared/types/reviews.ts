export type ExamReviewPeriodType = 'WRITE' | 'ADMIN_EDIT';

export interface ExamReviewPeriodBase {
  type: ExamReviewPeriodType;
  title: string;
  startAt: string;
  endAt: string;
}

export interface ExamReviewPeriod extends ExamReviewPeriodBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateExamReviewPeriod = ExamReviewPeriodBase[];
export type UpdateExamReviewPeriod = ExamReviewPeriodBase;
