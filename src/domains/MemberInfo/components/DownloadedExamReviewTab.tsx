import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useState } from 'react';

import { DOWNLOADEDEXAMREVIEW_SAMPLE_DATA } from '@/__mocks__';
import MemberInfoPagination from './MemberInfoTablePagenation';

interface DownloadedExamReviewTabProps {
  loginId?: string;
  studentNumber?: string;
}

export default function DownloadedExamReviewTab({
  loginId,
  studentNumber,
}: DownloadedExamReviewTabProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const downloadedData = DOWNLOADEDEXAMREVIEW_SAMPLE_DATA.filter((history) => {
    return (
      history.loginId === loginId || history.studentNumber === studentNumber
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
        <TableHeader className='z-10 bg-gray-100 shadow-sm'>
          <TableRow>
            <TableHead className='text-center'>번호</TableHead>
            <TableHead className='text-center'>id</TableHead>
            <TableHead className='text-center'>시험후기명</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className='bg-white'>
          {pageData.length > 0 ? (
            pageData.map((history, index) => (
              <TableRow
                key={history.postId}
                className='border-b-1 hover:bg-gray-100'
              >
                <TableCell className='text-center'>
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell
                  onClick={() => handleCopy(history.postId)}
                  className={`cursor-pointer text-center text-blue-600 underline hover:text-blue-800 ${copiedId === history.postId ? 'ml-2 text-purple-600' : ''} `}
                >
                  {history.postId}
                </TableCell>

                <TableCell
                  className='cursor-pointer text-center'
                  onClick={() => handleClickReview(history.postId)}
                >
                  {history.title}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className='py-6 text-center text-gray-500'>
                다운로드한 시험후기 내역이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
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
