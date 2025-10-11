import ExamTable from '@/components/exam/ExamTable';
import ExamPeriod from '@/components/exam/ExamPeriod';

export default function ExamReviewPage() {
  return (
    <div className='w-full max-w-full py-10 px-6 box-border'>
      {/* 검색창 */}
      <input
        type='text'
        placeholder='검색'
        className='w-[480px] h-[36px] rounded-2xl border-2 border-blue-500 bg-white px-4 py-2 mb-6'
      />

      {/* 필터 */}
      <ExamPeriod />

      {/* 시험후기 테이블 */}
      <ExamTable />
    </div>
  );
}
