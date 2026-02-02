import { ExamEditPanel } from '@/domains/Reviews/components';
import type {
  ExamReview,
  ExamReviewDetailResult,
} from '@/domains/Reviews/types';

interface ExamDetailSectionProps {
  selectedExamReview?: ExamReview | null;
  selectedExamReviewDetail?: ExamReviewDetailResult | null;
  isLoadingDetail?: boolean;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function ExamDetailSection({
  selectedExamReview,
  selectedExamReviewDetail,
  isLoadingDetail,
  onSaveSuccess,
  onDeleteSuccess,
}: ExamDetailSectionProps = {}) {
  return (
    <div className='flex overflow-hidden rounded-lg border border-gray-200'>
      <div className='flex-1'>
        <ExamEditPanel
          selectedExamReview={selectedExamReview}
          selectedExamReviewDetail={selectedExamReviewDetail}
          isLoadingDetail={isLoadingDetail}
          onSaveSuccess={onSaveSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      </div>
    </div>
  );
}
