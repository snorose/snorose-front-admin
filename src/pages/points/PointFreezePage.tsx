import { PageHeader } from '@/shared/components';
import { getErrorMessage } from '@/shared/utils';

import {
  PointFreezeListSection,
  PointFreezeScheduleForm,
} from '@/domains/Points/components';
import { usePointFreezes } from '@/domains/Points/hooks';

export default function PointFreezePage() {
  const {
    data: pointFreezes = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = usePointFreezes();

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='미지급 일정 관리'
        description='포인트 미지급 일정을 생성, 조회, 수정, 삭제할 수 있어요.'
      />

      <PointFreezeScheduleForm />

      <PointFreezeListSection
        pointFreezes={pointFreezes}
        isLoading={isPending}
        isFetching={isFetching}
        errorMessage={
          error
            ? getErrorMessage(error, '미지급 일정 조회에 실패했습니다.')
            : undefined
        }
        onRetry={() => {
          void refetch();
        }}
      />
    </div>
  );
}
