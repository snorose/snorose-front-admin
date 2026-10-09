import { useState } from 'react';
import { ko } from 'react-day-picker/locale';

import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button, Calendar, Popover } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

interface DatePickerProps {
  id: string;
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function parseDateValue(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(date) && format(date, 'yyyy-MM-dd') === value
    ? date
    : undefined;
}

export function DatePicker({
  id,
  value,
  onValueChange,
  placeholder = '날짜 선택',
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>();
  const date = parseDateValue(value);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setMonth(date ?? new Date());
    setOpen(nextOpen);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    onValueChange(
      selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
    );
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          id={id}
          type='button'
          variant='outline'
          disabled={disabled}
          className={cn(
            'border-input w-full min-w-0 justify-between text-left font-normal',
            className
          )}
        >
          <span className={cn('truncate', !date && 'text-muted-foreground')}>
            {date ? format(date, 'yyyy-MM-dd') : placeholder}
          </span>
          <CalendarIcon aria-hidden='true' />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align='start'
        collisionPadding={16}
        aria-labelledby={id}
        className='max-h-(--radix-popover-content-available-height) w-auto max-w-(--radix-popover-content-available-width) overflow-auto p-0'
      >
        <Calendar
          mode='single'
          selected={date}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          locale={ko}
          autoFocus
        />
        {value && (
          <div className='border-t p-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='w-full'
              onClick={() => handleSelect(undefined)}
            >
              날짜 선택 해제
            </Button>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
