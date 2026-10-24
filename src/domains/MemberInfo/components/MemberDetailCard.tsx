import { type ReactNode, useId } from 'react';

import type { LucideIcon } from 'lucide-react';

import { SectionTitle } from '@/shared/components';

type InfoBlockProps = {
  label: string;
  tone?: 'default' | 'muted';
  value: ReactNode;
  valueClassName?: string;
};

type SectionCardProps = {
  action?: ReactNode;
  children: ReactNode;
  icon: LucideIcon;
  title: string;
};

export function InfoBlock({
  label,
  tone,
  value,
  valueClassName,
}: InfoBlockProps) {
  return (
    <div className='space-y-2'>
      <p className='text-sm font-medium text-gray-700'>{label}</p>
      <div
        className={
          tone === 'muted'
            ? 'rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900'
            : undefined
        }
      >
        <p
          className={`text-sm font-semibold text-slate-900 ${valueClassName ?? ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function SectionCard({
  action,
  children,
  icon: Icon,
  title,
}: SectionCardProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className='flex min-w-0 flex-col gap-1'>
      <div className='flex min-h-9 min-w-0 flex-wrap items-center justify-between gap-2'>
        <SectionTitle id={titleId} className='flex min-w-0 items-center gap-2'>
          <Icon className='h-5 w-5 shrink-0' aria-hidden='true' />
          {title}
        </SectionTitle>
        {action}
      </div>
      <div className='border-border bg-background min-w-0 rounded-lg border p-4'>
        {children}
      </div>
    </section>
  );
}
