import { type ReactNode, useId } from 'react';

import type { LucideIcon } from 'lucide-react';

import { SectionTitle } from '@/shared/components';
import { cn } from '@/shared/lib';

type SectionCardProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  icon: LucideIcon;
  title: string;
  titleClassName?: string;
};

export function SectionCard({
  action,
  children,
  className,
  icon: Icon,
  title,
  titleClassName,
}: SectionCardProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className='flex min-w-0 flex-col gap-1'>
      <div className='flex min-h-9 min-w-0 flex-wrap items-center justify-between gap-2'>
        <SectionTitle
          id={titleId}
          className={cn('flex min-w-0 items-center gap-2', titleClassName)}
        >
          <Icon className='h-5 w-5 shrink-0' aria-hidden='true' />
          {title}
        </SectionTitle>
        {action}
      </div>
      <div
        className={cn(
          'border-border bg-background min-w-0 rounded-lg border p-4',
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}
