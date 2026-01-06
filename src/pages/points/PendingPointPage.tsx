import { PageHeader } from '@/components';

export default function PendingPointPage() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='미지급 일정 관리'
        description='포인트 미지급 일정을 생성, 조회, 수정, 삭제할 수 있어요.'
      />
    </div>
  );
}
