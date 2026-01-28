import { PageHeader } from '@/shared/components';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getPointFreezesAPI } from '@/apis';
import { toast } from 'sonner';
import type { PointFreeze } from '@/shared/types';
import {
  PointFreezeListSection,
  PointFreezeScheduleForm,
} from '@/domains/Points';
import { getErrorMessage } from '@/shared/utils';

export default function PointFreezePage() {
  const [pointFreezes, setPointFreezes] = useState<PointFreeze[]>([]);

  const isFetchingRef = useRef(false);

  const getPointFreezes = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const data = await getPointFreezesAPI();
      setPointFreezes(data.result as PointFreeze[]);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '미지급 일정 조회에 실패했습니다.'));
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    getPointFreezes();
  }, [getPointFreezes]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='미지급 일정 관리'
        description='포인트 미지급 일정을 생성, 조회, 수정, 삭제할 수 있어요.'
      />

      <PointFreezeScheduleForm onSuccess={getPointFreezes} />

      <PointFreezeListSection
        pointFreezes={pointFreezes}
        getPointFreezes={getPointFreezes}
      />
    </div>
  );
}
