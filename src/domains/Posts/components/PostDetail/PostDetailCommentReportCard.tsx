import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { formatDateTimeWithAmPm } from '@/shared/utils';

import type { AdminCommentReportResponse } from '@/domains/Comments/types';

import { getCommentReports } from '@/apis';

interface PostDetailCommentReportCardProps {
  commentId: number;
}

export default function PostDetailCommentReportCard({
  commentId,
}: PostDetailCommentReportCardProps) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['commentReports', commentId],
    queryFn: () => getCommentReports(commentId),
    enabled: commentId > 0,
  });
  const reports = data?.reports ?? [];

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h3 className='text-[14px] font-bold text-gray-900'>댓글 신고 내역</h3>
        <StatusBadge tone='danger'>총 {data?.totalCount ?? 0}건</StatusBadge>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center gap-2 py-4 text-xs text-gray-400'>
          <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
          신고 내역을 불러오는 중입니다.
        </div>
      ) : isError ? (
        <div className='py-4 text-center text-xs text-red-500'>
          신고 내역을 불러오지 못했습니다.
        </div>
      ) : reports.length === 0 ? (
        <div className='py-4 text-center text-xs text-gray-400'>
          이 댓글의 신고 내역이 없습니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3 text-xs leading-relaxed'>
          {reports.map((report: AdminCommentReportResponse, index) => (
            <div
              key={`${report.reportedAt}-${report.reporterNickname}-${index}`}
              className='flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-none last:pb-0'
            >
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>신고자</span>
                <span className='font-semibold text-gray-700'>
                  {report.reporterNickname}
                </span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>날짜</span>
                <span className='font-mono text-gray-600'>
                  {formatDateTimeWithAmPm(report.reportedAt)}
                </span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>사유</span>
                <span className='font-semibold text-red-600'>
                  {report.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
