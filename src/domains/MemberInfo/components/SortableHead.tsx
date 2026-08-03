import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

type SortableHeadProps = {
  label: string;
  columnType: string;
  sortType: string;
  sortDirection: string;
  isSortActive: boolean;
  onSort: (columnType: string) => void;
};

export default function SortableHead({
  label,
  columnType,
  sortType,
  sortDirection,
  isSortActive,
  onSort,
}: SortableHeadProps) {
  const isActive = isSortActive && sortType === columnType;
  const SortIcon = !isActive
    ? ArrowUpDown
    : sortDirection === 'ASC'
      ? ArrowUp
      : ArrowDown;

  return (
    <Table.Head
      className='px-4'
      aria-sort={
        isActive
          ? sortDirection === 'ASC'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <button
        type='button'
        onClick={() => onSort(columnType)}
        aria-label={`${label} 정렬`}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1 select-none',
          isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
        )}
      >
        {label}
        <SortIcon className='h-3.5 w-3.5' />
      </button>
    </Table.Head>
  );
}
