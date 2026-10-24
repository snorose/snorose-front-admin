import { Link } from 'react-router-dom';

import { BookOpen, ChevronRight } from 'lucide-react';

import { StatusBadge } from '@/shared/components';

import { SectionCard } from './MemberDetailCard';
import { DETAIL_SHORTCUTS, type DetailShortcut } from './memberDetailConstants';

const SHORTCUT_CLASS_NAME =
  'border-border flex min-h-12 w-full min-w-0 items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors';

export default function MemberActivitySection({
  studentNumber,
}: {
  studentNumber: string;
}) {
  return (
    <SectionCard icon={BookOpen} title='회원 활동 내역'>
      <ul className='grid gap-2 sm:grid-cols-2'>
        {DETAIL_SHORTCUTS.map((shortcut) => (
          <li key={shortcut.title} className='min-w-0'>
            <ActivityShortcut
              shortcut={shortcut}
              studentNumber={studentNumber}
            />
          </li>
        ))}
      </ul>
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
      <shortcut.icon className='size-4 shrink-0' aria-hidden='true' />
      <span className='min-w-0 flex-1 font-medium wrap-break-word'>
        {shortcut.title}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        title={shortcut.description}
        className={`${SHORTCUT_CLASS_NAME} text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none`}
      >
        {content}
        <ChevronRight
          className='text-muted-foreground size-4 shrink-0'
          aria-hidden='true'
        />
      </Link>
    );
  }

  return (
    <button
      type='button'
      disabled
      className={`${SHORTCUT_CLASS_NAME} bg-muted/30 text-muted-foreground cursor-not-allowed`}
    >
      {content}
      <StatusBadge tone='neutral'>준비 중</StatusBadge>
    </button>
  );
}
