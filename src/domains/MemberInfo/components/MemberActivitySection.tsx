import { BookOpen } from 'lucide-react';

import { SectionCard } from '@/domains/MemberInfo/components/MemberDetailCard';
import { DETAIL_SHORTCUTS } from '@/domains/MemberInfo/components/memberDetailConstants';

export default function MemberActivitySection() {
  return (
    <SectionCard icon={BookOpen} title='회원 활동 내역'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {DETAIL_SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.title}
            type='button'
            disabled
            className='flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center transition disabled:cursor-not-allowed disabled:opacity-100'
          >
            <shortcut.icon className='h-8 w-8 text-slate-800' />
            <div className='space-y-1'>
              <p className='font-semibold text-slate-900'>{shortcut.title}</p>
              <p className='text-sm text-slate-500'>{shortcut.description}</p>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
