import { Table } from '@/shared/components/ui';
import { useState } from 'react';

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
  const [copiedId, setCopiedId] = useState<number | null>(null);
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
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClickReview = (postId: number) => {
    const base = import.meta.env.VITE_SNOROSE_EXAM_REVIEW_URL;
    const url = `${base}/${postId}`;
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
                <Table.Cell
                  onClick={() => handleCopy(history.postId)}
                  className={`cursor-pointer text-center text-blue-600 underline hover:text-blue-800 ${copiedId === history.postId ? 'ml-2 text-purple-600' : ''} `}
                >
                  {history.postId}
                </Table.Cell>

                <Table.Cell
                  className='cursor-pointer text-center'
                  onClick={() => handleClickReview(history.postId)}
                >
                  {history.title}
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={3}
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
