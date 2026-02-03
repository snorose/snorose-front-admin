import { useEffect, useState } from 'react';

import * as Popover from '@radix-ui/react-popover';

import { STATUS_COLOR } from '@/shared/constants';

export interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: string[];
  contentClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  showStatusDot?: boolean;
  children: React.ReactNode;
}

export const MultiSelect = ({
  value,
  onValueChange,
  options,
  contentClassName = '',
  side = 'bottom',
  align = 'start',
  showStatusDot = false,
  children,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  // 드롭다운이 열려있을 때 body 스크롤 막기
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  const allSelected =
    options.length > 0 && options.every((opt) => value.includes(opt));
  const handleSelectAll = () => {
    if (allSelected) {
      onValueChange([]);
    } else {
      onValueChange([...options]);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={4}
          className={`text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[200px] min-w-[8rem] origin-[var(--radix-select-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-blue-50 shadow-md ${contentClassName}`}
        >
          <div className='p-1'>
            {/* 전체 선택/해제 체크박스 */}
            <div
              className='relative mb-1 flex w-full cursor-default items-center rounded-sm border-b border-gray-200 px-1.5 py-1.5 text-xs outline-none select-none hover:bg-blue-100/50'
              onClick={handleSelectAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectAll();
                }
              }}
              role='option'
              tabIndex={0}
            >
              <input
                type='checkbox'
                checked={allSelected}
                onChange={() => {}}
                className={`relative mr-2 h-3 w-3 shrink-0 cursor-pointer appearance-none rounded border-2 ${
                  allSelected
                    ? 'border-blue-500 bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[8px] checked:before:text-white checked:before:content-["✓"]'
                    : 'border-gray-300 bg-transparent'
                }`}
                tabIndex={-1}
              />
              <span className='flex-1 font-medium'>전체 선택</span>
            </div>
            {options.map((option) => {
              const isSelected = value.includes(option);
              const statusOption = showStatusDot
                ? STATUS_COLOR.find((s) => s.label === option)
                : null;
              return (
                <div
                  key={option}
                  className='relative flex w-full cursor-default items-center rounded-sm px-1.5 py-1.5 text-xs outline-none select-none hover:bg-blue-100/50'
                  onClick={() => handleToggle(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(option);
                    }
                  }}
                  role='option'
                  aria-selected={isSelected}
                  tabIndex={0}
                >
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => {}}
                    className={`relative mr-2 h-3 w-3 shrink-0 cursor-pointer appearance-none rounded border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[8px] checked:before:text-white checked:before:content-["✓"]'
                        : 'border-gray-300 bg-transparent'
                    }`}
                    tabIndex={-1}
                  />
                  <span className='flex-1'>{option}</span>
                  {showStatusDot && statusOption && (
                    <div className='ml-2 h-2 w-2 shrink-0 rounded-full bg-blue-500' />
                  )}
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
