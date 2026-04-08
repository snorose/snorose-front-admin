import { PageHeader } from '@/shared/components';

export default function PostPage() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='게시글 관리'
        description='삭제된 게시글을 조회할 수 있어요.'
      />
    </div>
  );
}
