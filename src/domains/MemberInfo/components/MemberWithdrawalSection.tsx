import { TriangleAlert } from 'lucide-react';

import { Button } from '@/shared/components/ui';

import { WITHDRAWAL_WARNINGS } from '@/domains/MemberInfo/components/memberDetailConstants';

export default function MemberWithdrawalSection() {
  return (
    <section className='rounded-3xl border border-rose-200 bg-white p-6 shadow-sm'>
      <div className='flex items-center gap-2 text-lg font-semibold text-rose-600'>
        <TriangleAlert className='h-5 w-5' />
        회원 탈퇴
      </div>

      <div className='mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5'>
        <p className='text-base font-semibold text-rose-700'>
          회원 탈퇴 시 주의사항
        </p>
        <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-rose-600'>
          {WITHDRAWAL_WARNINGS.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </div>

      <Button
        type='button'
        variant='destructive'
        className='mt-5 w-full'
        disabled
      >
        회원 탈퇴 API 연동 예정
      </Button>
    </section>
  );
}
