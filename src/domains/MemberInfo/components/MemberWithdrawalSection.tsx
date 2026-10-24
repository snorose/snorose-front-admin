import { useId } from 'react';

import { TriangleAlert } from 'lucide-react';

import { SectionTitle } from '@/shared/components';
import { Button } from '@/shared/components/ui';

import { WITHDRAWAL_WARNINGS } from '@/domains/MemberInfo/components/memberDetailConstants';

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

      <div className='bg-background flex min-w-0 flex-1 flex-col justify-between gap-3 rounded-lg border border-rose-200 p-4'>
        <div className='min-w-0 space-y-3'>
          <ul className='text-foreground list-disc space-y-1 pl-4 text-sm leading-5 marker:text-slate-400'>
            {WITHDRAWAL_WARNINGS.slice(0, -1).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <p className='text-destructive text-sm leading-5 font-medium'>
            {WITHDRAWAL_WARNINGS.at(-1)}
          </p>
        </div>

        <div className='flex shrink-0 items-center justify-end gap-2'>
          <span className='text-muted-foreground text-xs'>준비 중</span>
          <Button type='button' variant='destructive-outline' disabled>
            회원 탈퇴
          </Button>
        </div>
      </div>
    </section>
  );
}
