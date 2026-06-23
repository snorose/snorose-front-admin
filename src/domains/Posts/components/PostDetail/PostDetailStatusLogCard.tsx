import { Badge } from '@/shared/components/ui';
import { formatDateTimeWithAmPm } from '@/shared/utils';

import { getPostStatusBadges } from '@/domains/Comments/utils/commentUtils';

interface StatusLog {
  id: number;
  changedAt: string;
  admin: string;
  reason: string;
  statusBefore: string;
  statusAfter: string;
  detailReason?: string;
}

interface PostDetailStatusLogCardProps {
  statusLogs: StatusLog[];
}

export default function PostDetailStatusLogCard({
  statusLogs,
}: PostDetailStatusLogCardProps) {
  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <h3 className='text-[14px] font-bold text-gray-900'>
        게시글 상태 변경 내역
      </h3>
      {statusLogs.length === 0 ? (
        <div className='py-4 text-center text-xs text-gray-400'>
          {/* TODO: 상태 변경 기록 API 연동 시 주석 해제 및 '개발 중입니다.' 삭제 */}
          {/* 상태 변경 기록이 없습니다. */}
          개발 중입니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3 text-xs leading-relaxed'>
          {statusLogs.map((log) => (
            <div
              key={log.id}
              className='flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-none last:pb-0'
            >
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2'>
                <span className='font-medium text-gray-400'>사유</span>
                <div>
                  <div className='flex flex-wrap gap-1'>
                    {getPostStatusBadges({
                      reportCount: 0,
                      adminCommonStatuses: [log.reason],
                    }).map((badge, idx) => (
                      <Badge
                        key={idx}
                        variant='unstyled'
                        className={badge.className}
                      >
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>처리자</span>
                <span className='font-semibold text-gray-700'>{log.admin}</span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>변경 날짜</span>
                <span className='font-mono text-gray-600'>
                  {formatDateTimeWithAmPm(log.changedAt)}
                </span>
              </div>
              {log.detailReason && (
                <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                  <span className='font-medium text-gray-400'>상세 사유</span>
                  <span className='text-gray-600'>{log.detailReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export type { StatusLog };
