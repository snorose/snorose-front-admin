import ExamTable from '@/components/exam/ExamTable';
import ExamSearch from '@/components/exam/ExamSearch';
import ExamIconInfo from '@/components/exam/ExamIconInfo';
import ExamPanel from '@/components/exam/ExamPanel';
import PageHeader from '@/components/PageHeader';

export default function ExamReviewPage() {
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
      <ExamTable />

      {/* 시험후기 패널 - 편집, 삭제, 경고, 메모, 강등... */}
      <ExamPanel />
    </div>
  );
}
