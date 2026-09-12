import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { PaginationBar, StatusBadge } from '@/shared/components';
import { useStableTotalPage } from '@/shared/hooks';
import type { AdminSanctionResponse } from '@/shared/types';
import { clampOneBasedPage, formatDateTimeWithAmPm } from '@/shared/utils';

import { getCommentSanction } from '@/apis';

interface PostDetailCommentSanctionCardProps {
  commentId: number;
}

export default function PostDetailCommentSanctionCard({
  commentId,
}: PostDetailCommentSanctionCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isLoading } = useQuery({
    queryKey: ['commentSanctions', commentId, currentPage],
    queryFn: () => getCommentSanction(commentId, currentPage),
    enabled: commentId > 0,
  });
  const sanctions = data?.data ?? [];
  const totalPage = useStableTotalPage(data?.totalPage, currentPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [commentId]);

  useEffect(() => {
    if (isLoading) return;

    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) setCurrentPage(validPage);
  }, [currentPage, isLoading, totalPage]);

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <h3 className='text-[14px] font-bold text-gray-900'>댓글 제재 내역</h3>

      {isLoading ? (
        <div className='flex items-center justify-center gap-2 py-4 text-xs text-gray-400'>
          <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
          제재 내역을 불러오는 중입니다.
        </div>
      ) : isError ? (
        <div className='py-4 text-center text-xs text-red-500'>
          제재 내역을 불러오지 못했습니다.
        </div>
      ) : sanctions.length === 0 ? (
        <div className='py-4 text-center text-xs text-gray-400'>
          이 댓글을 통한 제재 내역이 없습니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3 text-xs leading-relaxed'>
          {sanctions.map((sanction: AdminSanctionResponse, index) => (
            <div
              key={`${sanction.createdAt}-${sanction.encryptedAdminId}-${index}`}
              className='flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-none last:pb-0'
            >
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2'>
                <span className='font-medium text-gray-400'>징계 종류</span>
                <div>
                  <StatusBadge tone='danger'>{sanction.type}</StatusBadge>
                </div>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>부여 일자</span>
                <span className='font-mono text-gray-600'>
                  {formatDateTimeWithAmPm(sanction.createdAt)}
                </span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>처리자</span>
                <span className='break-all text-gray-600'>
                  {sanction.encryptedAdminId}
                </span>
              </div>
              {sanction.startAt && (
                <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                  <span className='font-medium text-gray-400'>징계 기간</span>
                  <span className='font-mono text-gray-600'>
                    {sanction.startAt.substring(0, 10)} ~{' '}
                    {sanction.endAt?.substring(0, 10) ?? '종료일 없음'}
                  </span>
                </div>
              )}
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>징계 사유</span>
                <span className='text-gray-700'>{sanction.reason}</span>
              </div>
              {sanction.memo && (
                <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                  <span className='font-medium text-gray-400'>메모</span>
                  <span className='text-gray-700'>{sanction.memo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && totalPage > 1 && (
        <PaginationBar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPage={totalPage}
        />
      )}
    </div>
  );
}
