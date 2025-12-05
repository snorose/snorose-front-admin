import ExamTable from '@/components/exam/ExamTable';
import ExamPeriod from '@/components/exam/ExamPeriod';

export default function ExamReviewPage() {
  return (
    <div className='box-border w-full max-w-full pt-6'>
      {/* 검색창 */}
      <input
        type='text'
        placeholder='검색'
        className='mb-4 h-8 w-[480px] rounded-md border-1 border-gray-500 bg-white px-4 py-2 text-sm'
      />

      {/* 기간 필터 */}
      <ExamPeriod />

      {/* 시험후기 테이블 */}
      <ExamTable />
    </div>
  );
}
