import type { ReactNode } from 'react';

export default function PenaltyHistoryField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className='block space-y-2'>
      <span className='text-sm font-bold text-slate-900'>{label}</span>
      {children}
    </label>
  );
}
