import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { Table } from '@/shared/components/ui';
import type { BlacklistHistoryItem } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import { blacklistHistoryAPI } from '@/apis';

import MemberInfoPagination from './MemberInfoTablePagenation';

interface BlacklistHistoryTabProps {
  loginId?: string;
  encryptedUserId?: string;
  studentNumber?: string; // mock fallback용
  groupSize?: number;
  refreshKey?: number;
}

export default function BlacklistHistoryTab({
  encryptedUserId,
  studentNumber,
  groupSize = 10,
  refreshKey = 0,
}: BlacklistHistoryTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<BlacklistHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /** 블랙리스트 이력 조회 API */
  useEffect(() => {
    if (!encryptedUserId) {
      setHistoryData([]);
      setIsLoading(false);
      setCurrentPage(1);
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setCurrentPage(1);
        const data = await blacklistHistoryAPI(encryptedUserId);

        if (data?.result) {
          setHistoryData(data.result);
          return;
        }

        // API 정상이지만 데이터 없음
        setHistoryData([]);
      } catch (error) {
        toast.error(getErrorMessage(error, '블랙리스트 조회에 실패했습니다.'));
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [encryptedUserId, studentNumber, refreshKey]);

  /** 페이지 데이터 */
  const downloadedData = historyData;
  const pageData = downloadedData.slice(
    (currentPage - 1) * groupSize,
    currentPage * groupSize
  );
  const emptyCount = groupSize - pageData.length;

  return (
    <div className='no-scrollbar scroll-hidden overflow-x-scroll'>
      <Table className='w-full border-separate border-spacing-0 rounded-md border-2 border-solid [&_td]:border-r [&_td]:border-b [&_th]:border-r [&_th]:border-b'>
        {/* Header */}
        <Table.Header className='z-10 bg-gray-100 shadow-sm'>
          <Table.Row>
            <Table.Head className='text-center'>번호</Table.Head>
            <Table.Head className='text-center'>유형</Table.Head>
            <Table.Head className='text-center'>사유</Table.Head>
            <Table.Head className='text-center'>생성일</Table.Head>
            <Table.Head className='text-center'>해제일</Table.Head>
          </Table.Row>
        </Table.Header>

        {/* Body */}
        <Table.Body className='bg-white'>
          {!encryptedUserId ? (
            <Table.Row>
              <Table.Cell
                colSpan={5}
                className='py-6 text-center text-gray-500'
              >
                회원을 검색해 주세요.
              </Table.Cell>
            </Table.Row>
          ) : isLoading ? (
            <Table.Row>
              <Table.Cell
                colSpan={5}
                className='py-6 text-center text-gray-500'
              >
                로딩 중...
              </Table.Cell>
            </Table.Row>
          ) : pageData.length > 0 ? (
            <>
              {pageData.map((history, index) => (
                <Table.Row key={index} className='border-b-1 hover:bg-gray-100'>
                  <Table.Cell className='w-[50px] text-center'>
                    {(currentPage - 1) * groupSize + index + 1}
                  </Table.Cell>
                  <Table.Cell className='text-center'>
                    {history.type}
                  </Table.Cell>
                  <Table.Cell className='text-center'>
                    {history.blackReason}
                  </Table.Cell>
                  <Table.Cell className='text-center'>
                    {history.createdAt}
                  </Table.Cell>
                  <Table.Cell
                    className={`text-center ${
                      history.blacklistDeadline === null ? 'bg-gray-50' : ''
                    }`}
                  >
                    {history.blacklistDeadline}
                  </Table.Cell>
                </Table.Row>
              ))}

              {/* 빈 셀 채우기 (테이블 높이 고정 목적) */}
              {Array.from({ length: emptyCount }).map((_, idx) => (
                <Table.Row
                  key={`empty-${idx}`}
                  className='pointer-events-none h-7 bg-gray-50'
                >
                  <Table.Cell colSpan={5}></Table.Cell>
                </Table.Row>
              ))}
            </>
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={5}
                className='py-6 text-center text-gray-500'
              >
                강등 / 경고 내역이 없습니다.
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      {encryptedUserId && downloadedData.length > 0 && (
        <MemberInfoPagination
          currentPage={currentPage}
          totalPages={Math.ceil(downloadedData.length / groupSize)}
          onPageChange={setCurrentPage}
          groupSize={groupSize}
        />
      )}
    </div>
  );
}
