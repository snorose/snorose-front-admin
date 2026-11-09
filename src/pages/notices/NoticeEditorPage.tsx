import { Link, useParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import NoticeEditorForm from '@/domains/Notices/components/NoticeEditorForm';
import { useNotices } from '@/domains/Notices/hooks/useNotices';

export default function NoticeEditorPage() {
  const { noticeId } = useParams();
  const { notices, canEdit } = useNotices();
  const notice = notices.find((item) => item.id === Number(noticeId));
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
