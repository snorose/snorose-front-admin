import { useState } from 'react';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Table } from '@/shared/components/ui/table';

import { convertCategoryEnumToString } from '@/domains/MemberInfo/utils/memberInfoFormatters';

import { USERPOINT_SAMPLE_DATA } from '@/__mocks__';

import MemberInfoPagination from './MemberInfoTablePagenation';

interface PointHistoryTabProps {
  encryptedUserId?: string;
  studentNumber?: string;
}

export default function PointHistoryTab({
  encryptedUserId,
  studentNumber,
}: PointHistoryTabProps) {
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
    toast.success('복사되었습니다.');
  };

  return (
    <div className='no-scrollbar scroll-hidden overflow-x-scroll'>
      <Table className='border- w-full border-separate border-spacing-0 rounded-md border-2 border-solid [&_td]:border-r [&_td]:border-b [&_th]:border-r [&_th]:border-b'>
        {/* Header */}
        <Table.Header className='bg-gray-100'>
          <Table.Row>
            <Table.Head className='text-center'>번호</Table.Head>
            <Table.Head className='text-center'>포인트 ID</Table.Head>
            <Table.Head className='text-center'>분류</Table.Head>
            <Table.Head className='text-center'>분류 사유</Table.Head>
            <Table.Head className='text-center'>상세 사유</Table.Head>
            <Table.Head className='text-center'>포인트</Table.Head>
            <Table.Head className='text-center'>일시</Table.Head>
            <Table.Head className='text-center'>잔액</Table.Head>
          </Table.Row>
        </Table.Header>

        {/* Body */}
        <Table.Body>
          {paginatedData.length > 0 ? (
            paginatedData.map((history, index) => (
              <Table.Row
                key={history.sourceId}
                className='bg-white hover:bg-gray-50'
              >
                <Table.Cell className='text-center'>
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </Table.Cell>

                {/* 포인트 ID 복사 */}
                <Table.Cell className='text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <span>{history.sourceId}</span>

                    <button
                      type='button'
                      onClick={() => handleCopy(history.sourceId)}
                      aria-label='복사'
                      className='rounded p-1 text-gray-600 transition hover:bg-gray-100 hover:text-black'
                    >
                      <Copy className='h-4 w-4' />
                    </button>
                  </div>
                </Table.Cell>

                <Table.Cell className='text-center'>
                  {convertCategoryEnumToString(history.category).category}
                </Table.Cell>
                <Table.Cell className='text-center'>
                  {convertCategoryEnumToString(history.category).detail}
                </Table.Cell>

                <Table.Cell className='text-center'>
                  {history.sourceDetail}
                </Table.Cell>

                <Table.Cell
                  className={`text-center font-bold ${history.difference > 0 ? 'text-blue-700' : 'text-red-700'}`}
                >
                  {history.difference}
                </Table.Cell>

                <Table.Cell className='text-center'>
                  {history.createAt.replace('T', ' ')}
                </Table.Cell>

                <Table.Cell
                  className={`text-center font-bold ${
                    history.pointBalance === null ? 'bg-gray-50' : ''
                  } `}
                >
                  {history.pointBalance}
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={8}
                className='bg-white py-6 text-center text-gray-500'
              >
                포인트 적립 내역이 없습니다.
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
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
