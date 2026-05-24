import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components';

import { InquiryReportTable } from '@/domains/InquiryReport';

export default function InquiryReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const handlePageChange = (
    pageOrUpdater: number | ((prev: number) => number)
  ) => {
    const next =
      typeof pageOrUpdater === 'function'
        ? pageOrUpdater(currentPage)
        : pageOrUpdater;

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('page', next.toString());
    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <div className='flex w-full flex-col gap-6 pb-12'>
      <PageHeader
        title='문의 및 신고'
        description='접수된 문의 및 신고 목록을 조회할 수 있습니다.'
      />

      <InquiryReportTable
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
