import { useState } from 'react';

import { Check, ChevronsUpDown, Search } from 'lucide-react';

import { Input, Popover } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import type { DirectoryFilterOption } from '@/domains/MemberInfo/utils/memberDirectory';

type SearchableSelectProps = {
  label: string;
  onValueChange: (value: string) => void;
  options: DirectoryFilterOption[];
  placeholder: string;
  value: string;
  includeAllOption?: boolean;
  isActive?: boolean;
};

export default function SearchableSelect({
  label,
  onValueChange,
  options,
  placeholder,
  value,
  includeAllOption = true,
  isActive = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allOptions = includeAllOption
    ? [{ value: 'ALL', label: '전체' }, ...options]
    : options;

  const keyword = query.trim().toLowerCase();
  const filtered = keyword
    ? allOptions.filter((option) =>
        option.label.toLowerCase().includes(keyword)
      )
    : allOptions;

  const selectedLabel = allOptions.find(
    (option) => option.value === value
  )?.label;
  const hasSelection = Boolean(selectedLabel) && value !== 'ALL';

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    handleOpenChange(false);
  };

  return (
    <div className='space-y-2'>
      <span className='text-sm font-medium text-slate-700'>{label}</span>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type='button'
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-2xl border border-slate-200 px-4 text-left text-sm shadow-none',
              isActive ? 'bg-blue-50' : 'bg-white'
            )}
          >
            <span
              className={cn(
                'truncate',
                hasSelection ? 'text-slate-900' : 'text-slate-400'
              )}
            >
              {hasSelection ? selectedLabel : placeholder}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 text-slate-400' />
          </button>
        </Popover.Trigger>
        <Popover.Content
          align='start'
          className='w-[var(--radix-popover-trigger-width)] p-0'
        >
          <div className='border-b border-slate-100 p-2'>
            <div className='relative'>
              <Search className='pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                autoFocus
                value={query}
                placeholder='검색...'
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  // 한글 등 IME 조합 확정용 Enter는 선택으로 처리하지 않는다.
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === 'Enter' && filtered.length > 0) {
                    event.preventDefault();
                    handleSelect(filtered[0].value);
                  }
                }}
                className='h-9 rounded-lg border-slate-200 pl-8 shadow-none'
              />
            </div>
          </div>
          <ul className='max-h-60 overflow-y-auto p-1'>
            {filtered.length === 0 ? (
              <li className='px-3 py-6 text-center text-sm text-slate-400'>
                검색 결과가 없습니다.
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type='button'
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50',
                      option.value === value
                        ? 'font-semibold text-slate-900'
                        : 'text-slate-700'
                    )}
                  >
                    <span className='truncate'>{option.label}</span>
                    {option.value === value && (
                      <Check className='ml-2 h-4 w-4 shrink-0 text-blue-600' />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </Popover.Content>
      </Popover>
    </div>
  );
}
