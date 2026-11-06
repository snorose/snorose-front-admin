import { type ReactNode, useId } from 'react';

import { ChevronDown } from 'lucide-react';

import { Button, DropdownMenu, Label } from '@/shared/components/ui';

interface FilterMultiSelectProps<T extends string | number> {
  label: string;
  value: readonly T[];
  options: readonly { value: T; label: string; content?: ReactNode }[];
  renderOption?: (option: {
    value: T;
    label: string;
    content?: ReactNode;
  }) => ReactNode;
  onValueChange: (value: T[]) => void;
  disabled?: boolean;
  showSelectedNames?: boolean;
}

export function FilterMultiSelect<T extends string | number>({
  label,
  value,
  options,
  renderOption,
  onValueChange,
  disabled = false,
  showSelectedNames = false,
}: FilterMultiSelectProps<T>) {
  const id = useId();
  const isDisabled = disabled || options.length === 0;
  const selectedOption =
    value.length === 1
      ? options.find((option) => option.value === value[0])
      : undefined;
  const selectedLabels = value.map(
    (selected) =>
      options.find((option) => option.value === selected)?.label ??
      String(selected)
  );
  const summary =
    value.length === 0
      ? '전체'
      : value.length === 1
        ? (selectedOption?.content ?? selectedOption?.label ?? String(value[0]))
        : showSelectedNames
          ? `${selectedLabels[0]} 외 ${value.length - 1}개`
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
            title={
              showSelectedNames && value.length
                ? selectedLabels.join(', ')
                : undefined
            }
            className='border-input h-9 w-full justify-between bg-transparent px-3 font-normal shadow-none'
          >
            <span id={`${id}-summary`} className='min-w-0 truncate'>
              {selectedOption && renderOption ? (
                renderOption(selectedOption)
              ) : showSelectedNames && value.length > 1 ? (
                <span className='flex min-w-0 gap-1'>
                  <span className='truncate'>{selectedLabels[0]}</span>
                  <span className='shrink-0'>외 {value.length - 1}개</span>
                </span>
              ) : (
                summary
              )}
            </span>
            <ChevronDown
              aria-hidden='true'
              className='size-4 shrink-0 opacity-50'
            />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align='start'
          className='max-h-[min(15rem,var(--radix-dropdown-menu-content-available-height))] w-[var(--radix-dropdown-menu-trigger-width)] max-w-[calc(100vw-2rem)] min-w-40'
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
              textValue={option.label}
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
              {option.content ??
                (renderOption ? (
                  renderOption(option)
                ) : (
                  <span className='truncate'>{option.label}</span>
                ))}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}
