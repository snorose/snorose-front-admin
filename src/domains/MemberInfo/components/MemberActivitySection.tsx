import { Link } from 'react-router-dom';

import { BookOpen } from 'lucide-react';

import { SectionCard } from './MemberDetailCard';
import { DETAIL_SHORTCUTS, type DetailShortcut } from './memberDetailConstants';

const SHORTCUT_CLASS_NAME =
  'flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center transition';

export default function MemberActivitySection({
  studentNumber,
}: {
  studentNumber: string;
}) {
  return (
    <SectionCard icon={BookOpen} title='회원 활동 내역'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {DETAIL_SHORTCUTS.map((shortcut) => (
          <ActivityShortcut
            key={shortcut.title}
            shortcut={shortcut}
            studentNumber={studentNumber}
          />
        ))}
      </div>
    </SectionCard>
  );
}

function ActivityShortcut({
  shortcut,
  studentNumber,
}: {
  shortcut: DetailShortcut;
  studentNumber: string;
}) {
  const href = studentNumber.trim()
    ? shortcut.getHref?.(studentNumber.trim())
    : undefined;
  const content = (
    <>
      <shortcut.icon className='h-8 w-8 text-slate-800' />
      <div className='space-y-1'>
        <p className='font-semibold text-slate-900'>{shortcut.title}</p>
        <p className='text-sm text-slate-500'>{shortcut.description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={`${SHORTCUT_CLASS_NAME} hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type='button'
      disabled
      className={`${SHORTCUT_CLASS_NAME} cursor-not-allowed opacity-60`}
    >
      {content}
    </button>
  );
}
