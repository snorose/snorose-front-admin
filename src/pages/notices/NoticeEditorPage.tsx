import { Link, useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';
import { useAuth } from '@/shared/hooks';
import { getErrorMessage } from '@/shared/utils';

import NoticeEditorForm from '@/domains/Notices/components/NoticeEditorForm';
import { useNotices } from '@/domains/Notices/hooks/useNotices';

export default function NoticeEditorPage() {
  const { noticeId } = useParams();
  const { notices, canEdit, loadNotice, isLoading } = useNotices();
  const { user } = useAuth();
  const id = Number(noticeId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const detail = useQuery({
    queryKey: ['adminNoticeEditor', user?.userId, noticeId],
    queryFn: () => loadNotice!(id),
    enabled: !!noticeId && validId && canEdit && !!loadNotice,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const notice = loadNotice
    ? detail.data
    : notices.find((item) => item.id === id);
  if (noticeId && !canEdit)
    return (
      <div className='flex flex-col items-start gap-4 py-12'>
        <PageHeader
          title='공지 수정은 준비 중입니다.'
          description='공지 목록에서 내용을 확인해 주세요.'
        />
        <Button asChild>
          <Link to={PATHS.NOTICE_GENERAL}>목록으로</Link>
        </Button>
      </div>
    );
  if (noticeId && validId && (loadNotice ? detail.isPending : isLoading))
    return <PageHeader title='공지를 불러오는 중입니다.' />;
  if (noticeId && loadNotice && detail.isError)
    return (
      <div className='flex flex-col items-start gap-4 py-12'>
        <PageHeader
          title='공지를 불러오지 못했습니다.'
          description={getErrorMessage(detail.error)}
        />
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              void detail.refetch();
            }}
          >
            다시 조회
          </Button>
          <Button asChild>
            <Link to={PATHS.NOTICE_GENERAL}>목록으로</Link>
          </Button>
        </div>
      </div>
    );
  if (noticeId && !notice)
    return (
      <div className='flex flex-col items-start gap-4 py-12'>
        <PageHeader
          title='공지를 찾을 수 없습니다.'
          description='목록으로 돌아가 수정할 공지를 다시 선택해 주세요.'
        />
        <Button asChild className='!text-white'>
          <Link to={PATHS.NOTICE_GENERAL}>목록으로</Link>
        </Button>
      </div>
    );
  return <NoticeEditorForm key={noticeId ?? 'new'} notice={notice} />;
}
