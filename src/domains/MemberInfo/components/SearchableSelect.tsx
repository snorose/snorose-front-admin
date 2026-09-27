import { useId, useState } from 'react';

import { Check, ChevronsUpDown, Search } from 'lucide-react';

import { InputGroup, Label, Popover } from '@/shared/components/ui';
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
  const inputId = useId();
  const labelId = `${inputId}-label`;
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
      <span id={labelId} className='text-foreground text-sm font-medium'>
        {label}
      </span>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type='button'
            aria-labelledby={labelId}
            className={cn(
              'border-input bg-background text-foreground flex h-9 w-full items-center justify-between rounded-md border px-3 text-left text-sm shadow-none',
              isActive ? 'bg-primary/10' : 'bg-background'
            )}
          >
            <span
              className={cn(
                'truncate',
                hasSelection ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {hasSelection ? selectedLabel : placeholder}
            </span>
            <ChevronsUpDown className='text-muted-foreground ml-2 h-4 w-4 shrink-0' />
          </button>
        </Popover.Trigger>
        <Popover.Content
          align='start'
          className='w-[var(--radix-popover-trigger-width)] p-0'
        >
          <div className='border-border border-b p-2'>
            <Label htmlFor={inputId} className='sr-only'>
              {label} 목록 검색
            </Label>
            <InputGroup>
              <InputGroup.Addon>
                <Search aria-hidden='true' />
              </InputGroup.Addon>
              <InputGroup.Input
                id={inputId}
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
              />
            </InputGroup>
          </div>
          <ul className='max-h-60 overflow-y-auto p-1'>
            {filtered.length === 0 ? (
              <li className='text-muted-foreground px-3 py-6 text-center text-sm'>
                검색 결과가 없습니다.
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type='button'
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'hover:bg-accent flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                      option.value === value
                        ? 'text-foreground font-semibold'
                        : 'text-foreground'
                    )}
                  >
                    <span className='truncate'>{option.label}</span>
                    {option.value === value && (
                      <Check className='text-primary ml-2 h-4 w-4 shrink-0' />
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
