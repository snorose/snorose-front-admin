import { useState } from 'react';
import ExamTable from '@/components/exam/ExamTable';
import ExamSearch from '@/components/exam/ExamSearch';
import ExamIconInfo from '@/components/exam/ExamIconInfo';
import ExamPanel from '@/components/exam/ExamPanel';
import PageHeader from '@/components/PageHeader';
import type { ExamReview } from '@/components/exam/ExamTable';

export default function ExamReviewPage() {
  const [selectedExamReview, setSelectedExamReview] =
    useState<ExamReview | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaveSuccess = () => {
    // Table과 Panel을 새로고침하기 위해 refreshKey 증가
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteSuccess = () => {
    // 삭제 후 선택 해제 및 테이블 새로고침
    setSelectedExamReview(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className='box-border w-full max-w-full'>
      {/* 검색 + 아이콘 정보*/}
      <div className='flex items-end justify-between'>
        <div>
          <PageHeader
            title='시험후기 관리'
            description='시험후기를 편집하거나 삭제하고, 경고 및 강등 처리를 할 수 있어요.'
          />
          <ExamSearch />
        </div>

        <ExamIconInfo />
      </div>

      {/* 시험후기 테이블 */}
      <ExamTable
        onRowSelect={setSelectedExamReview}
        refreshKey={refreshKey}
        selectedId={selectedExamReview?.id}
      />

      {/* 시험후기 패널 - 편집, 삭제, 경고, 메모, 강등... */}
      <ExamPanel
        selectedExamReview={selectedExamReview}
        onSaveSuccess={handleSaveSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
