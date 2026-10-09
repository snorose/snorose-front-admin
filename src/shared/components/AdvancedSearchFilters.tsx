import type { ReactNode } from 'react';

interface AdvancedSearchFiltersProps {
  children: ReactNode;
}

export function AdvancedSearchFilters({
  children,
}: AdvancedSearchFiltersProps) {
  return <div className='flex min-w-0 flex-col gap-4'>{children}</div>;
}
