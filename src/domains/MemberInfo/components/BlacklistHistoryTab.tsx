import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import MemberInfoPagination from './MemberInfoTablePagenation';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/utils';

import { blacklistHistoryAPI } from '@/apis';
import { BLACKLIST_SAMPLE_DATA } from '@/__mocks__';
import type { BlacklistHistoryItem } from '@/types/member';

interface BlacklistHistoryTabProps {
  loginId?: string;
  encryptedUserId?: string;
  studentNumber?: string; // mock fallback용
  groupSize?: number;
}

export default function BlacklistHistoryTab({
  encryptedUserId,
  studentNumber,
  groupSize = 10,
}: BlacklistHistoryTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<BlacklistHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /** 블랙리스트 이력 조회 API */
  useEffect(() => {
    if (!encryptedUserId) return;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await blacklistHistoryAPI(encryptedUserId);

        if (data?.result) {
          setHistoryData(data.result);
          return;
        }

        // API 정상이지만 데이터 없음
        setHistoryData([]);
      } catch (error) {
        toast.error(getErrorMessage(error, '블랙리스트 조회에 실패했습니다.'));

        // fallback (미완성 API용)
        const mock = BLACKLIST_SAMPLE_DATA.filter(
          (item) =>
            item.encryptedUserId === encryptedUserId ||
            item.studentNumber === studentNumber
        );

        if (mock.length > 0) {
          setHistoryData(mock);
        } else {
          setHistoryData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [encryptedUserId, studentNumber]);

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
        <TableHeader className='z-10 bg-gray-100 shadow-sm'>
          <TableRow>
            <TableHead className='text-center'>번호</TableHead>
            <TableHead className='text-center'>유형</TableHead>
            <TableHead className='text-center'>사유</TableHead>
            <TableHead className='text-center'>생성일</TableHead>
            <TableHead className='text-center'>해제일</TableHead>
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody className='bg-white'>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className='py-6 text-center text-gray-500'>
                로딩 중...
              </TableCell>
            </TableRow>
          ) : pageData.length > 0 ? (
            <>
              {pageData.map((history, index) => (
                <TableRow key={index} className='border-b-1 hover:bg-gray-100'>
                  <TableCell className='w-[50px] text-center'>
                    {(currentPage - 1) * groupSize + index + 1}
                  </TableCell>
                  <TableCell className='text-center'>{history.type}</TableCell>
                  <TableCell className='text-center'>
                    {history.blackReason}
                  </TableCell>
                  <TableCell className='text-center'>
                    {history.createdAt}
                  </TableCell>
                  <TableCell
                    className={`text-center ${
                      history.blacklistDeadline === null ? 'bg-gray-50' : ''
                    }`}
                  >
                    {history.blacklistDeadline}
                  </TableCell>
                </TableRow>
              ))}

              {/* 빈 셀 채우기 (테이블 높이 고정 목적) */}
              {Array.from({ length: emptyCount }).map((_, idx) => (
                <TableRow
                  key={`empty-${idx}`}
                  className='pointer-events-none h-7 bg-gray-50'
                >
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={5} className='py-6 text-center text-gray-500'>
                강등 / 경고 내역이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 페이지네이션 */}
      {downloadedData.length > 0 && (
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
