import { type KeyboardEvent, useId, useRef, useState } from 'react';

import { Check, ChevronsUpDown, Search } from 'lucide-react';

import { Button, InputGroup, Label, Popover } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

type SearchableSelectProps = {
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  searchable?: boolean;
  isActive?: boolean;
} & (
  | {
      multiple?: false;
      value: string;
      onValueChange: (value: string) => void;
      includeAllOption?: boolean;
    }
  | {
      multiple: true;
      value: readonly string[];
      onValueChange: (value: string[]) => void;
    }
);

export function SearchableSelect(props: SearchableSelectProps) {
  const {
    label,
    options,
    placeholder,
    searchable = true,
    isActive = false,
  } = props;
  const id = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const allOptions =
    !props.multiple && (props.includeAllOption ?? true)
      ? [{ value: 'ALL', label: '전체' }, ...options]
      : options;
  const keyword = query.trim().toLowerCase();
  const filtered = keyword
    ? allOptions.filter((option) =>
        option.label.toLowerCase().includes(keyword)
      )
    : allOptions;
  const selectedValues = props.multiple
    ? props.value
    : props.value === 'ALL'
      ? []
      : [props.value];
  const summary =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
        ? (options.find((option) => option.value === selectedValues[0])
            ?.label ?? selectedValues[0])
        : `${label} ${selectedValues.length}개`;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const handleSelect = (value: string) => {
    if (props.multiple) {
      props.onValueChange(
        props.value.includes(value)
          ? props.value.filter((selected) => selected !== value)
          : [...props.value, value]
      );
    } else {
      props.onValueChange(value);
      handleOpenChange(false);
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.nativeEvent.isComposing) return;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
    );
    if (!buttons.length) return;
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    let nextIndex: number;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
    else if (event.key === 'ArrowUp')
      nextIndex =
        index < 0
          ? buttons.length - 1
          : (index - 1 + buttons.length) % buttons.length;
    else if (index >= 0 && event.key === 'Home') nextIndex = 0;
    else if (index >= 0 && event.key === 'End') nextIndex = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[nextIndex].focus();
    buttons[nextIndex].scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className='flex min-w-0 flex-col gap-1'>
      <Label id={`${id}-label`} htmlFor={`${id}-trigger`}>
        {label}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <Button
            id={`${id}-trigger`}
            type='button'
            variant='outline'
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-summary`}
            className={cn(
              'border-input h-9 w-full min-w-0 justify-between bg-transparent px-3 font-normal shadow-none',
              isActive && 'bg-primary/10'
            )}
          >
            <span id={`${id}-summary`} className='truncate'>
              {summary}
            </span>
            <ChevronsUpDown
              aria-hidden='true'
              className='text-muted-foreground size-4 shrink-0'
            />
          </Button>
        </Popover.Trigger>
        <Popover.Content
          align='start'
          aria-label={`${label} 선택`}
          className='flex max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0'
        >
          {searchable && (
            <div className='border-border shrink-0 border-b p-2'>
              <Label htmlFor={`${id}-query`} className='sr-only'>
                {label} 목록 검색
              </Label>
              <InputGroup className='shadow-none'>
                <InputGroup.Addon>
                  <Search aria-hidden='true' />
                </InputGroup.Addon>
                <InputGroup.Input
                  id={`${id}-query`}
                  autoFocus
                  value={query}
                  placeholder='검색...'
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing) return;
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (filtered.length > 0) handleSelect(filtered[0].value);
                    } else handleListKeyDown(event);
                  }}
                />
              </InputGroup>
            </div>
          )}
          {props.multiple && (
            <div className='border-border shrink-0 border-b p-1'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='w-full justify-start font-normal'
                disabled={props.value.length === 0}
                onClick={() => props.onValueChange([])}
              >
                선택 해제
              </Button>
            </div>
          )}
          <ul
            ref={listRef}
            aria-label={`${label} 목록`}
            className='max-h-60 min-h-0 overflow-y-auto p-1'
            onKeyDown={handleListKeyDown}
          >
            {filtered.length === 0 ? (
              <li
                role='status'
                className='text-muted-foreground px-3 py-6 text-center text-sm'
              >
                검색 결과가 없습니다.
              </li>
            ) : (
              filtered.map((option) => {
                const selected = props.multiple
                  ? props.value.includes(option.value)
                  : props.value === option.value;
                return (
                  <li key={option.value}>
                    <button
                      type='button'
                      role={props.multiple ? 'checkbox' : undefined}
                      aria-checked={props.multiple ? selected : undefined}
                      aria-current={
                        !props.multiple && selected ? 'true' : undefined
                      }
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'hover:bg-accent focus-visible:ring-ring flex min-h-8 w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none',
                        selected && 'font-semibold'
                      )}
                    >
                      <span className='truncate'>{option.label}</span>
                      {selected && (
                        <Check
                          aria-hidden='true'
                          className='text-primary size-4 shrink-0'
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </Popover.Content>
      </Popover>
    </div>
  );
}
