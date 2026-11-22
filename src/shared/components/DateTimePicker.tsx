import { type AriaAttributes, useId } from 'react';

import { Label, Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateValue, parseDateValue } from '@/shared/utils';

import { DatePicker } from './DatePicker';
import { EditableMinuteInput } from './EditableMinuteInput';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

interface DateTimePickerProps
  extends Pick<AriaAttributes, 'aria-describedby' | 'aria-invalid'> {
  label: string;
  date: Date | undefined;
  time: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  datePlaceholder?: string;
  minDate?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  layout?: 'responsive' | 'horizontal';
  hour12?: boolean;
  minuteStep?: number;
  editableMinutes?: boolean;
}

export function DateTimePicker({
  label,
  date,
  time,
  onDateSelect,
  onTimeChange,
  datePlaceholder = '날짜 선택',
  minDate,
  required = false,
  className = '',
  disabled = false,
  hideLabel = false,
  layout = 'responsive',
  hour12 = false,
  minuteStep = 1,
  editableMinutes = false,
  ...accessibilityProps
}: DateTimePickerProps) {
  const id = useId();
  const dateId = `${id}-date`;
  const [hour = '00', minute = '00'] = (time || '00:00').split(':');
  const period = Number(hour) >= 12 ? 'PM' : 'AM';
  const hours = hour12 ? HOURS.slice(1, 13) : HOURS;
  const displayHour = hour12
    ? String(Number(hour) % 12 || 12).padStart(2, '0')
    : hour;
  const step =
    Number.isInteger(minuteStep) && minuteStep >= 1 && minuteStep <= 60
      ? minuteStep
      : 1;
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) =>
    String(i * step).padStart(2, '0')
  );

  return (
    <div className={cn('@container flex min-w-0 flex-col gap-1', className)}>
      <Label
        htmlFor={dateId}
        required={required}
        className={hideLabel ? 'sr-only' : undefined}
      >
        {label}
      </Label>
      <div
        className={cn(
          'grid gap-2',
          layout === 'horizontal'
            ? 'grid-cols-2'
            : hour12
              ? 'grid-cols-1 @min-[32rem]:grid-cols-[minmax(0,1fr)_minmax(17rem,1fr)]'
              : 'grid-cols-1 @min-[24rem]:grid-cols-2'
        )}
      >
        <DatePicker
          id={dateId}
          value={formatDateValue(date)}
          onValueChange={(value) => onDateSelect(parseDateValue(value))}
          placeholder={datePlaceholder}
          minDate={minDate}
          aria-label={label}
          disabled={disabled}
          {...accessibilityProps}
        />

        <div
          className={cn(
            'flex min-w-0 items-center gap-2',
            hour12 && 'flex-wrap'
          )}
        >
          {hour12 && (
            <Select
              value={period}
              disabled={disabled}
              onValueChange={(nextPeriod) =>
                onTimeChange(
                  `${String((Number(hour) % 12) + (nextPeriod === 'PM' ? 12 : 0)).padStart(2, '0')}:${minute}`
                )
              }
            >
              <Select.Trigger
                type='button'
                aria-label={`${label} 오전/오후`}
                {...accessibilityProps}
                className='bg-background min-w-20 flex-1'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='AM'>오전</Select.Item>
                <Select.Item value='PM'>오후</Select.Item>
              </Select.Content>
            </Select>
          )}
          <Select
            value={displayHour}
            disabled={disabled}
            onValueChange={(newHour) =>
              onTimeChange(
                `${hour12 ? String((Number(newHour) % 12) + (period === 'PM' ? 12 : 0)).padStart(2, '0') : newHour}:${minute}`
              )
            }
          >
            <Select.Trigger
              id={`${id}-hour`}
              type='button'
              aria-label={`${label} 시`}
              {...accessibilityProps}
              className={cn(
                'bg-background min-w-0 flex-1',
                hour12 && 'min-w-20'
              )}
              size='default'
            >
              <Select.Value placeholder='시' />
            </Select.Trigger>
            <Select.Content className='max-h-[200px] overflow-y-auto'>
              {hours.map((hour) => (
                <Select.Item key={hour} value={hour}>
                  {hour12 ? Number(hour) : hour}시
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {editableMinutes ? (
            <EditableMinuteInput
              label={`${label} 분`}
              value={minute}
              suggestions={minutes}
              disabled={disabled}
              onValueChange={(nextMinute) =>
                onTimeChange(`${hour}:${nextMinute}`)
              }
              {...accessibilityProps}
            />
          ) : (
            <Select
              value={minute}
              disabled={disabled}
              onValueChange={(newMinute) =>
                onTimeChange(`${hour}:${newMinute}`)
              }
            >
              <Select.Trigger
                id={`${id}-minute`}
                type='button'
                aria-label={`${label} 분`}
                {...accessibilityProps}
                className='bg-background min-w-0 flex-1'
                size='default'
              >
                <Select.Value placeholder='분' />
              </Select.Trigger>
              <Select.Content className='max-h-[200px] overflow-y-auto'>
                {minutes.map((minute) => (
                  <Select.Item key={minute} value={minute}>
                    {minute}분
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
