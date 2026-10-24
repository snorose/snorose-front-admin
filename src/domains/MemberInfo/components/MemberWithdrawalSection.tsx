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
        className='flex items-center gap-2 text-rose-600'
      >
        <TriangleAlert className='h-5 w-5 shrink-0' aria-hidden='true' />
        회원 탈퇴
      </SectionTitle>

      <div className='bg-background flex min-w-0 flex-col gap-4 rounded-lg border border-rose-200 p-4'>
        <div className='rounded-md bg-rose-50 p-4'>
          <p className='text-base font-semibold text-rose-700'>
            회원 탈퇴 시 주의사항
          </p>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-rose-600'>
            {WITHDRAWAL_WARNINGS.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>

        <Button type='button' variant='destructive' className='w-full' disabled>
          회원 탈퇴 API 연동 예정
        </Button>
      </div>
    </section>
  );
}
