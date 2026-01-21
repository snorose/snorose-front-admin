import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

import { BLACKLIST_SAMPLE_DATA } from '@/__mocks__';
import MemberInfoPagination from './MemberInfoTablePagenation';

interface BlacklistHistoryTabProps {
  loginId?: string;
  studentNumber?: string;
}

export default function BlacklistHistoryTab({
  loginId,
  studentNumber,
}: BlacklistHistoryTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const downloadedData = BLACKLIST_SAMPLE_DATA.filter((history) => {
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

  return (
    <div className='no-scrollbar scroll-hidden overflow-x-scroll'>
      <Table className='w-full border-separate border-spacing-0 rounded-md border-2 border-solid [&_td]:border-r [&_td]:border-b [&_th]:border-r [&_th]:border-b'>
        {/* Table Header */}
        <TableHeader className='z-10 bg-gray-100 shadow-sm'>
          <TableRow>
            <TableHead className='text-center'>번호</TableHead>
            <TableHead className='text-center'>유형</TableHead>
            <TableHead className='text-center'>사유</TableHead>
            <TableHead className='text-center'>생성일</TableHead>
            <TableHead className='text-center'>해제일</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className='bg-white'>
          {pageData.length > 0 ? (
            pageData.map((history, index) => (
              <TableRow key={index} className='border-b-1 hover:bg-gray-100'>
                <TableCell className='w-[50px] text-center'>
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </TableCell>

                <TableCell className='text-center'>{history.type}</TableCell>
                <TableCell className='text-center'>
                  {history.blackReason}
                </TableCell>

                <TableCell className='text-center'>
                  {history.blacklistStartDate}
                </TableCell>
                <TableCell
                  className={`text-center ${
                    history.blacklistEndDate === null ? 'bg-gray-50' : ''
                  }`}
                >
                  {history.blacklistEndDate}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className='py-6 text-center text-gray-500'>
                강등 / 경고 내역이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pageData.length > 0 && (
        <MemberInfoPagination
          currentPage={currentPage}
          totalPages={Math.ceil(downloadedData.length / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
