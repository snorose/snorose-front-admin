import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components';
import type { InquiryStatus } from '@/shared/types';
import { parseOneBasedPage } from '@/shared/utils';

import {
  InquiryReportDetailPanel,
  InquiryReportTable,
} from '@/domains/InquiryReport';
import { useUpdateInquiryStatus } from '@/domains/InquiryReport/hooks';

export default function InquiryReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = searchParams.get('page');
  const currentPage = parseOneBasedPage(rawPage);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const { mutateAsync: updateStatus } = useUpdateInquiryStatus();

  useEffect(() => {
    if (rawPage === null || rawPage === String(currentPage)) return;

    const normalizedSearchParams = new URLSearchParams(searchParams);
    normalizedSearchParams.set('page', String(currentPage));
    setSearchParams(normalizedSearchParams, { replace: true });
  }, [currentPage, rawPage, searchParams, setSearchParams]);

  const handlePageChange = (page: number) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('page', String(Math.max(1, page)));
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleStatusChange = async (
    inquiryId: number,
    nextStatus: InquiryStatus
  ) => {
    await updateStatus({ inquiryId, status: nextStatus });
  };

  return (
    <div className='flex w-full flex-col gap-6 pb-12'>
      <PageHeader
        title='문의 및 신고'
        description='접수된 문의 및 신고 목록을 조회할 수 있습니다.'
      />

      <div className='flex flex-col items-stretch gap-4 xl:flex-row xl:items-start'>
        <div className='min-w-0 flex-1'>
          <InquiryReportTable
            currentPage={currentPage}
            onPageChange={handlePageChange}
            selectedPostId={selectedPostId}
            onRowSelect={setSelectedPostId}
            onStatusChange={handleStatusChange}
          />
        </div>
        {selectedPostId !== null && (
          <div className='w-full min-w-0 xl:sticky xl:top-4 xl:mt-[48px] xl:flex-1 xl:basis-0'>
            <InquiryReportDetailPanel
              postId={selectedPostId}
              onClose={() => setSelectedPostId(null)}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
