import { Badge } from '@/shared/components/ui';
import { formatDateTimeWithAmPm } from '@/shared/utils';

interface ReportItem {
  id: number;
  reportedAt: string;
  reporter: string;
  reason: string;
}

interface PostDetailReportCardProps {
  reportCount: number;
  reportsList: ReportItem[];
}

export default function PostDetailReportCard({
  reportCount,
  reportsList,
}: PostDetailReportCardProps) {
  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h3 className='text-[14px] font-bold text-gray-900'>신고 내역</h3>
        <Badge className='rounded border-none bg-[#DC2626] px-2 py-0.5 text-[10px] font-bold text-white'>
          총 {reportCount}건
        </Badge>
      </div>
      {reportsList.length === 0 ? (
        <div className='py-4 text-center text-xs text-gray-400'>
          신고 내역이 없습니다.
        </div>
      ) : (
        <div className='flex flex-col gap-3 text-xs leading-relaxed'>
          {reportsList.map((item) => (
            <div
              key={item.id}
              className='flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-none last:pb-0'
            >
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>신고자</span>
                <span className='font-semibold text-gray-700'>
                  {item.reporter}
                </span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>날짜</span>
                <span className='font-mono text-gray-600'>
                  {formatDateTimeWithAmPm(item.reportedAt)}
                </span>
              </div>
              <div className='grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'>
                <span className='font-medium text-gray-400'>사유</span>
                <span className='font-semibold text-red-600'>
                  {item.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
