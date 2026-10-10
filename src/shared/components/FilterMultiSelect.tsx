import { useId } from 'react';

import { ChevronDown } from 'lucide-react';

import { Button, DropdownMenu, Label } from '@/shared/components/ui';

interface FilterMultiSelectProps<T extends string | number> {
  label: string;
  value: readonly T[];
  options: readonly { value: T; label: string }[];
  onValueChange: (value: T[]) => void;
  disabled?: boolean;
}

export function FilterMultiSelect<T extends string | number>({
  label,
  value,
  options,
  onValueChange,
  disabled = false,
}: FilterMultiSelectProps<T>) {
  const id = useId();
  const isDisabled = disabled || options.length === 0;
  const summary =
    value.length === 0
      ? '전체'
      : value.length === 1
        ? (options.find((option) => option.value === value[0])?.label ??
          String(value[0]))
        : `${label} ${value.length}개`;

  return (
    <div className='flex min-w-0 flex-col gap-1'>
      <Label id={`${id}-label`} htmlFor={id}>
        {label}
      </Label>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild disabled={isDisabled}>
          <Button
            id={id}
            type='button'
            variant='outline'
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-summary`}
            disabled={isDisabled}
            className='border-input h-9 w-full justify-between bg-transparent px-3 font-normal shadow-xs'
          >
            <span id={`${id}-summary`} className='truncate'>
              {summary}
            </span>
            <ChevronDown aria-hidden='true' className='size-4 opacity-50' />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align='start'
          className='w-[var(--radix-dropdown-menu-trigger-width)] max-w-[calc(100vw-2rem)] min-w-40'
        >
          <DropdownMenu.Item
            disabled={value.length === 0}
            onSelect={(event) => {
              event.preventDefault();
              onValueChange([]);
            }}
          >
            선택 해제
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          {options.map((option) => (
            <DropdownMenu.CheckboxItem
              key={option.value}
              checked={value.includes(option.value)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onValueChange(
                  checked
                    ? [...value, option.value]
                    : value.filter((selected) => selected !== option.value)
                )
              }
            >
              <span className='truncate'>{option.label}</span>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}
