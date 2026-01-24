import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

import { USERPOINT_SAMPLE_DATA } from '@/__mocks__';
import MemberInfoPagination from './MemberInfoTablePagenation';
import { convertCategoryEnumToString } from '@/domains/MemberInfo/utils/memberInfoFormatters';

interface PointHistoryTabProps {
  encryptedUserId?: string;
  studentNumber?: string;
}

export default function PointHistoryTab({
  encryptedUserId,
  studentNumber,
}: PointHistoryTabProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 한 페이지에 10개 이력
  const PAGE_SIZE = 10;

  const filteredData = USERPOINT_SAMPLE_DATA.filter(
    (history) =>
      history.encryptedUserId === encryptedUserId ||
      history.studentNumber === studentNumber
  );

  // 최신 순으로 이력 정렬
  const sortedData = [...filteredData].sort(
    (a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
  );

  // 데이터 자르기 (10개 기준)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 포인트 ID 클릭시 복사
  const handleCopy = async (sourceId: number) => {
    await navigator.clipboard.writeText(String(sourceId));
    setCopiedId(sourceId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className='no-scrollbar scroll-hidden overflow-x-scroll'>
      <Table className='border- w-full border-separate border-spacing-0 rounded-md border-2 border-solid [&_td]:border-r [&_td]:border-b [&_th]:border-r [&_th]:border-b'>
        {/* Header */}
        <TableHeader className='bg-gray-100'>
          <TableRow>
            <TableHead className='text-center'>번호</TableHead>
            <TableHead className='text-center'>포인트 ID</TableHead>
            <TableHead className='text-center'>분류</TableHead>
            <TableHead className='text-center'>분류 사유</TableHead>
            <TableHead className='text-center'>상세 사유</TableHead>
            <TableHead className='text-center'>포인트</TableHead>
            <TableHead className='text-center'>일시</TableHead>
            <TableHead className='text-center'>잔액</TableHead>
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((history, index) => (
              <TableRow
                key={history.sourceId}
                className='bg-white hover:bg-gray-50'
              >
                <TableCell className='text-center'>
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </TableCell>

                {/* 포인트 ID 복사 */}
                <TableCell
                  onClick={() => handleCopy(history.sourceId)}
                  className={`cursor-pointer text-center underline ${
                    copiedId === history.sourceId
                      ? 'text-purple-600'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {history.sourceId}
                </TableCell>

                <TableCell className='text-center'>
                  {convertCategoryEnumToString(history.category).category}
                </TableCell>
                <TableCell className='text-center'>
                  {convertCategoryEnumToString(history.category).detail}
                </TableCell>

                <TableCell className='text-center'>
                  {history.sourceDetail}
                </TableCell>

                <TableCell
                  className={`text-center font-bold ${history.difference > 0 ? 'text-green-700' : 'text-red-700'}`}
                >
                  {history.difference}
                </TableCell>

                <TableCell className='text-center'>
                  {history.createAt.replace('T', ' ')}
                </TableCell>

                <TableCell
                  className={`text-center font-bold ${
                    history.pointBalance === null ? 'bg-gray-50' : ''
                  } `}
                >
                  {history.pointBalance}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className='bg-white py-6 text-center text-gray-500'
              >
                포인트 적립 내역이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {paginatedData.length > 0 && (
        <MemberInfoPagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
