import { Badge, Skeleton } from '@/shared/components/ui';
import { Dialog } from '@/shared/components/ui/dialog';
import { formatDateTimeToMinutes } from '@/shared/utils';

import { usePost } from '../hooks/usePost';

export default function PostDetailModal({
  postId,
  deletedAt,
  onClose,
}: {
  postId: number | null;
  deletedAt: string | null;
  onClose: () => void;
}) {
  const { data, isPending } = usePost(postId, deletedAt);

  return (
    <Dialog open={!!postId} onOpenChange={() => onClose()}>
      <Dialog.Content className='max-w-2xl'>
        {isPending && (
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-17.5 w-full rounded-md' />
            <Skeleton className='h-41 w-full rounded-md' />
          </div>
        )}
        {!isPending && data && (
          <div className='flex flex-col gap-4'>
            {/* 상단: 메타 정보 */}
            <div className='flex flex-col gap-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-xs text-gray-400'>ID: {data.postId}</span>
                <span className='text-sm text-gray-500'>
                  {data.userDisplay}
                </span>
                <Badge variant='outline' className='text-xs'>
                  {data.category}
                </Badge>
                {!data.isVisible && (
                  <Badge
                    variant='outline'
                    className='border-yellow-200 bg-yellow-50 text-xs text-yellow-700'
                  >
                    미노출
                  </Badge>
                )}
                {data.deletedAt && (
                  <Badge
                    variant='outline'
                    className='border-red-200 bg-red-50 text-xs text-red-600'
                  >
                    삭제됨
                  </Badge>
                )}
                {data.isNotice && (
                  <Badge
                    variant='outline'
                    className='border-blue-200 bg-blue-50 text-xs text-blue-600'
                  >
                    공지
                  </Badge>
                )}
                {data.isKeywordExist && (
                  <Badge
                    variant='outline'
                    className='border-orange-200 bg-orange-50 text-xs text-orange-600'
                  >
                    위험키워드
                  </Badge>
                )}
              </div>
              <h2 className='text-base font-semibold'>{data.title}</h2>
              <div className='flex flex-wrap gap-x-3 text-xs text-gray-400'>
                <span>
                  작성{' '}
                  {formatDateTimeToMinutes(data.createdAt).replace('T', ' ')}
                </span>
                {data.updatedAt && (
                  <span>
                    수정{' '}
                    {formatDateTimeToMinutes(data.updatedAt).replace('T', ' ')}
                  </span>
                )}
                {data.deletedAt && (
                  <span className='text-red-400'>
                    삭제{' '}
                    {formatDateTimeToMinutes(data.deletedAt).replace('T', ' ')}
                  </span>
                )}
                {data.isEdited && <span>편집됨</span>}
              </div>
            </div>

            {/* 본문 */}
            <div className='min-h-[120px] rounded-md border bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-700'>
              {data.content || <span className='text-gray-400'>내용 없음</span>}
            </div>

            {/* 통계 */}
            <div className='flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs text-gray-500'>
              <span>조회 {data.viewCount}</span>
              <span>좋아요 {data.likeCount}</span>
              <span>스크랩 {data.scrapCount}</span>
              <span>댓글 {data.commentCount}</span>
              {data.reportCount > 0 && (
                <span className='text-red-500'>신고 {data.reportCount}</span>
              )}
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
}
