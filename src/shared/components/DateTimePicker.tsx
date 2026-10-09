import { type AriaAttributes, useId } from 'react';

import { Label, Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateValue, parseDateValue } from '@/shared/utils';

import { DatePicker } from './DatePicker';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0')
);

interface DateTimePickerProps extends Pick<
  AriaAttributes,
  'aria-describedby' | 'aria-invalid'
> {
  label: string;
  date: Date | undefined;
  time: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  datePlaceholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  label,
  date,
  time,
  onDateSelect,
  onTimeChange,
  datePlaceholder = '날짜 선택',
  required = false,
  className = '',
  disabled = false,
  ...accessibilityProps
}: DateTimePickerProps) {
  const id = useId();
  const dateId = `${id}-date`;
  const [hour = '00', minute = '00'] = (time || '00:00').split(':');

  return (
    <div className={cn('@container flex min-w-0 flex-col gap-1', className)}>
      <Label htmlFor={dateId} required={required}>
        {label}
      </Label>
      <div className='grid grid-cols-1 gap-2 @min-[24rem]:grid-cols-2'>
        <DatePicker
          id={dateId}
          value={formatDateValue(date)}
          onValueChange={(value) => onDateSelect(parseDateValue(value))}
          placeholder={datePlaceholder}
          aria-label={label}
          disabled={disabled}
          {...accessibilityProps}
        />

        <div className='flex min-w-0 items-center gap-2'>
          <Select
            value={hour}
            disabled={disabled}
            onValueChange={(newHour) => onTimeChange(`${newHour}:${minute}`)}
          >
            <Select.Trigger
              id={`${id}-hour`}
              type='button'
              aria-label={`${label} 시`}
              {...accessibilityProps}
              className='min-w-0 flex-1'
              size='default'
            >
              <Select.Value placeholder='시' />
            </Select.Trigger>
            <Select.Content className='max-h-[200px] overflow-y-auto'>
              {HOURS.map((hour) => (
                <Select.Item key={hour} value={hour}>
                  {hour}시
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Select
            value={minute}
            disabled={disabled}
            onValueChange={(newMinute) => onTimeChange(`${hour}:${newMinute}`)}
          >
            <Select.Trigger
              id={`${id}-minute`}
              type='button'
              aria-label={`${label} 분`}
              {...accessibilityProps}
              className='min-w-0 flex-1'
              size='default'
            >
              <Select.Value placeholder='분' />
            </Select.Trigger>
            <Select.Content className='max-h-[200px] overflow-y-auto'>
              {MINUTES.map((minute) => (
                <Select.Item key={minute} value={minute}>
                  {minute}분
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>
    </div>
  );
}
