import { Fragment, type ReactNode } from 'react';

import { cn } from '@/shared/lib';

export interface DescriptionListProps {
  items: { label: string; value: ReactNode }[];
  className?: string;
}

export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2.5 py-2 text-sm',
        className
      )}
    >
      {items.map(({ label, value }) => (
        <Fragment key={label}>
          <dt className='text-muted-foreground shrink-0 text-xs font-medium'>
            {label}
          </dt>
          <dd className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
            {value}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
