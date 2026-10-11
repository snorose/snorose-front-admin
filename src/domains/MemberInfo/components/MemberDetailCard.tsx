import type { ReactNode } from 'react';

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
            ? 'rounded-md bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900'
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
  return (
    <section className='rounded-md border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex items-center justify-between gap-4'>
        <SectionTitle className='flex items-center gap-2'>
          <Icon className='h-5 w-5' aria-hidden='true' />
          {title}
        </SectionTitle>
        {action}
      </div>
      <div className='mt-6'>{children}</div>
    </section>
  );
}
