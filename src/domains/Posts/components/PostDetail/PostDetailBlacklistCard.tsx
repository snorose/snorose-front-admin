import { Badge } from '@/shared/components/ui';
import type { UserBlacklistHistory } from '@/shared/types';
import { formatDateTimeWithAmPm } from '@/shared/utils';

export default function PostDetailBlacklistCard() {
  const historyData: UserBlacklistHistory[] = [];
  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <h3 className='text-[14px] font-bold text-gray-900'>징계 정보</h3>
      {historyData.length === 0 ? (
        <div className='py-4 text-center text-xs text-gray-400'>
          {/* TODO: 징계 내역 API 연동 시 주석 해제 및 '개발 중입니다.' 삭제 */}
          {/* 작성자의 징계 이력이 없습니다. */}
          개발 중입니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3 text-xs leading-relaxed'>
          {historyData.map((item: UserBlacklistHistory, index) => (
            <div
              key={item.encryptedUserId || index}
              className='flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-none last:pb-0'
            >
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2'>
                <span className='font-medium text-gray-400'>징계 종류</span>
                <div>
                  <Badge className='rounded border-none bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700'>
                    {item.type}
                  </Badge>
                </div>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>부여 일자</span>
                <span className='font-mono text-gray-600'>
                  {formatDateTimeWithAmPm(item.createdAt)}
                </span>
              </div>

              {item.blacklistStartDate && item.blacklistDeadline && (
                <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                  <span className='font-medium text-gray-400'>징계 기간</span>
                  <span className='font-mono text-gray-600'>
                    {item.blacklistStartDate.substring(0, 10)} ~{' '}
                    {item.blacklistDeadline.substring(0, 10)}
                  </span>
                </div>
              )}

              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>징계 사유</span>
                <span className='text-gray-700'>
                  {item.blackReason || '사유 미입력'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
