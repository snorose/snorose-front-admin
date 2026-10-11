import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib';

type SectionTitleProps = ComponentProps<'h2'>;

export function SectionTitle({ className, ...props }: SectionTitleProps) {
  return (
    <h2
      className={cn('text-lg font-bold text-gray-900', className)}
      {...props}
    />
  );
}
