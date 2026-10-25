import { TriangleAlert, UserRoundMinus } from 'lucide-react';

import { StatusBadge } from '@/shared/components';

import { SectionCard } from './MemberDetailCard';

export default function MemberWithdrawalSection() {
  return (
    <SectionCard
      icon={UserRoundMinus}
      className='border-0 p-0'
      title='회원 탈퇴'
      titleClassName='text-rose-600'
    >
      <ul className='grid gap-2'>
        <li className='min-w-0'>
          <button
            type='button'
            disabled
            className='border-destructive bg-background text-destructive flex min-h-12 w-full min-w-0 cursor-not-allowed items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm opacity-50 transition-colors'
          >
            <TriangleAlert className='size-4 shrink-0' aria-hidden='true' />
            <span className='min-w-0 flex-1 font-medium wrap-break-word'>
              회원 탈퇴
            </span>
            <StatusBadge tone='neutral'>준비 중</StatusBadge>
          </button>
        </li>
      </ul>
    </SectionCard>
  );
}
