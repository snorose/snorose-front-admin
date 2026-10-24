import { useId } from 'react';

import { TriangleAlert } from 'lucide-react';

import { SectionTitle } from '@/shared/components';
import { Button } from '@/shared/components/ui';

export default function MemberWithdrawalSection() {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className='flex min-w-0 flex-col gap-1'>
      <SectionTitle
        id={titleId}
        className='flex min-h-9 items-center gap-2 text-rose-600'
      >
        <TriangleAlert className='h-5 w-5 shrink-0' aria-hidden='true' />
        회원 탈퇴
      </SectionTitle>

      <Button
        type='button'
        variant='destructive-outline'
        className='w-full'
        title='준비 중인 기능입니다.'
        disabled
      >
        회원 탈퇴 (준비중)
      </Button>
    </section>
  );
}
