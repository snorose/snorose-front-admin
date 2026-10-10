import { type AriaAttributes, useState } from 'react';
import { ko } from 'react-day-picker/locale';

import { endOfYear, format, setYear, startOfYear } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button, Calendar, Popover } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateValue, parseDateValue } from '@/shared/utils';

interface DatePickerProps extends Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> {
  id: string;
  name?: string;
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
  clearable?: boolean;
  captionLayout?: 'label' | 'dropdown';
}

export function DatePicker({
  id,
  name,
  value,
  onValueChange,
  placeholder = '날짜 선택',
  disabled = false,
  className,
  minDate,
  maxDate,
  clearable = true,
  captionLayout = 'label',
  ...accessibilityProps
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>();
  const date = parseDateValue(value);
  const minimum = parseDateValue(minDate);
  const maximum = parseDateValue(maxDate);
  const invalidRange = Boolean(minimum && maximum && minimum > maximum);
  const today = new Date();

  const clampToRange = (candidate: Date) => {
    if (invalidRange) return candidate;
    if (minimum && candidate < minimum) return minimum;
    if (maximum && candidate > maximum) return maximum;
    return candidate;
  };

  const visibleMonth = clampToRange(month ?? date ?? today);
  // 탐색 범위는 선택 제한과 별개다. 현재 탐색 월까지 확장해 양방향 이동을 유지한다.
  const firstYear = Math.max(
    1,
    Math.min(
      today.getFullYear(),
      visibleMonth.getFullYear(),
      date?.getFullYear() ?? today.getFullYear()
    ) - 100
  );
  const lastYear = Math.min(
    9999,
    Math.max(
      today.getFullYear(),
      visibleMonth.getFullYear(),
      date?.getFullYear() ?? today.getFullYear()
    ) + 100
  );
  const startMonth =
    !invalidRange && minimum ? minimum : startOfYear(setYear(today, firstYear));
  const endMonth =
    !invalidRange && maximum ? maximum : endOfYear(setYear(today, lastYear));

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setMonth(clampToRange(date ?? today));
    setOpen(nextOpen);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!clearable && !selectedDate) return;
    onValueChange(formatDateValue(selectedDate));
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          id={id}
          name={name}
          type='button'
          variant='outline'
          disabled={disabled}
          {...accessibilityProps}
          className={cn(
            'border-input w-full min-w-0 justify-between text-left font-normal',
            className
          )}
        >
          <span className={cn('truncate', !date && 'text-muted-foreground')}>
            {formatDateValue(date) ?? placeholder}
          </span>
          <CalendarIcon aria-hidden='true' />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align='start'
        collisionPadding={16}
        aria-label={accessibilityProps['aria-label']}
        aria-labelledby={
          accessibilityProps['aria-labelledby'] ??
          (accessibilityProps['aria-label'] ? undefined : id)
        }
        aria-describedby={accessibilityProps['aria-describedby']}
        className='max-h-(--radix-popover-content-available-height) w-auto max-w-(--radix-popover-content-available-width) overflow-auto p-0'
      >
        <Calendar
          mode='single'
          required={!clearable}
          captionLayout={captionLayout}
          selected={date}
          onSelect={handleSelect}
          month={visibleMonth}
          onMonthChange={setMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={
            invalidRange
              ? true
              : [
                  ...(minimum ? [{ before: minimum }] : []),
                  ...(maximum ? [{ after: maximum }] : []),
                ]
          }
          locale={ko}
          formatters={{
            formatMonthDropdown: (date) => format(date, 'M월'),
            formatYearDropdown: (date) => format(date, 'yyyy년'),
          }}
          autoFocus
        />
        {clearable && value && (
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
