import { useState } from 'react';

import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Table } from '@/shared/components/ui';

import { DOWNLOADEDEXAMREVIEW_SAMPLE_DATA } from '@/__mocks__';

import MemberInfoPagination from './MemberInfoTablePagenation';

interface DownloadedExamReviewTabProps {
  encryptedUserId?: string;
  studentNumber?: string;
}

export default function DownloadedExamReviewTab({
  encryptedUserId,
  studentNumber,
}: DownloadedExamReviewTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const downloadedData = DOWNLOADEDEXAMREVIEW_SAMPLE_DATA.filter((history) => {
    return (
      history.encryptedUserId === encryptedUserId ||
      history.studentNumber === studentNumber
    );
  });

  // 페이지당 10개씩 데이터 자르기
  const PAGE_SIZE = 10;
  const pageData = downloadedData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleCopy = async (postId: number) => {
    await navigator.clipboard.writeText(String(postId));
    toast.success('복사되었습니다.');
  };

  const handleGoToReview = (title: string) => {
    const keyword = encodeURIComponent(title);
    const url = `/reviews/exam?keyword=${keyword}&page=1`;
    window.open(url, '_blank');
  };

  return (
    <div className='no-scrollbar scroll-hidden overflow-x-scroll'>
      <Table className='w-full border-separate border-spacing-0 rounded-md border-2 border-solid [&_td]:border-r [&_td]:border-b [&_th]:border-r [&_th]:border-b'>
        {/* Table Header */}
        <Table.Header className='z-10 bg-gray-100 shadow-sm'>
          <Table.Row>
            <Table.Head className='text-center'>번호</Table.Head>
            <Table.Head className='text-center'>id</Table.Head>
            <Table.Head className='text-center'>시험후기명</Table.Head>
            <Table.Head className='text-center'>시험후기관리</Table.Head>
          </Table.Row>
        </Table.Header>

        {/* Table Body */}
        <Table.Body className='bg-white'>
          {pageData.length > 0 ? (
            pageData.map((history, index) => (
              <Table.Row
                key={history.postId}
                className='border-b-1 hover:bg-gray-100'
              >
                <Table.Cell className='text-center'>
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </Table.Cell>
                <Table.Cell className='text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <span>{history.postId}</span>
                    <button
                      type='button'
                      onClick={() => handleCopy(history.postId)}
                      aria-label='id 복사'
                      className={`rounded p-1 transition hover:bg-gray-100`}
                    >
                      <Copy className='h-4 w-4' />
                    </button>
                  </div>
                </Table.Cell>

                <Table.Cell className='text-center'>{history.title}</Table.Cell>
                <Table.Cell className='text-center'>
                  <button
                    type='button'
                    onClick={() => handleGoToReview(history.title)}
                    aria-label='시험후기 바로가기'
                    className='rounded p-1 text-gray-600 transition hover:bg-gray-100 hover:text-blue-700'
                  >
                    <ExternalLink className='h-4 w-4' />
                  </button>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={4}
                className='py-6 text-center text-gray-500'
              >
                다운로드한 시험후기 내역이 없습니다.
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {downloadedData.length > 0 && (
        <MemberInfoPagination
          currentPage={currentPage}
          totalPages={Math.ceil(downloadedData.length / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
