import { PageHeader } from '@/shared/components';

export default function PostPage() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='게시글 관리'
        description='게시글을 관리할 수 있어요.'
      />
    </div>
  );
}
