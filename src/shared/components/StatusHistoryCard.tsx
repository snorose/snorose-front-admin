import { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

import { STATUS_HISTORY_LABELS } from '@/shared/constants/status-history';
import { useStableTotalPage } from '@/shared/hooks';
import type { AdminStatusHistory } from '@/shared/types/status-history';
import { clampOneBasedPage, formatDateTimeWithAmPm } from '@/shared/utils';

import { PaginationBar } from './PaginationBar';
import { StatusBadge } from './StatusBadge';

interface StatusHistoryCardProps {
  title: string;
  statusLogs: AdminStatusHistory[];
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  totalPage?: number;
  onPageChange: (page: number) => void;
}

export function StatusHistoryCard({
  title,
  statusLogs,
  isLoading,
  isError,
  currentPage,
  totalPage: responseTotalPage,
  onPageChange,
}: StatusHistoryCardProps) {
  const totalPage = useStableTotalPage(responseTotalPage, currentPage);

  useEffect(() => {
    if (isLoading) return;

    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) onPageChange(validPage);
  }, [currentPage, isLoading, totalPage, onPageChange]);

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <h3 className='text-[14px] font-bold text-gray-900'>{title}</h3>
      {isLoading ? (
        <div className='flex items-center justify-center gap-2 py-4 text-xs text-gray-400'>
          <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
          상태 변경 내역을 불러오는 중입니다.
        </div>
      ) : isError ? (
        <div className='py-4 text-center text-xs text-red-500'>
          상태 변경 내역을 불러오지 못했습니다.
        </div>
      ) : statusLogs.length === 0 ? (
        <div className='py-4 text-center text-xs text-gray-400'>
          상태 변경 내역이 없습니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3 text-xs leading-relaxed'>
          {statusLogs.map((log, index) => (
            <div
              key={`${log.changedAt}-${log.changedStatus}-${index}`}
              className='flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-none last:pb-0'
            >
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2'>
                <span className='font-medium text-gray-400'>변경 상태</span>
                <div>
                  <div className='flex flex-wrap gap-1'>
                    <StatusBadge tone='accent'>
                      {STATUS_HISTORY_LABELS[log.changedStatus]}
                    </StatusBadge>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>처리자</span>
                <span className='font-semibold text-gray-700'>
                  {log.actorNickname ?? '시스템'}
                </span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>변경 날짜</span>
                <span className='font-mono text-gray-600'>
                  {formatDateTimeWithAmPm(log.changedAt)}
                </span>
              </div>
              {log.memo && (
                <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                  <span className='font-medium text-gray-400'>메모</span>
                  <span className='text-gray-600'>{log.memo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!isLoading && !isError && totalPage > 1 && (
        <PaginationBar
          currentPage={currentPage}
          onPageChange={onPageChange}
          totalPage={totalPage}
        />
      )}
    </div>
  );
}
