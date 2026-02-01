import { useMemo, useState } from 'react';

import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';

import {
  Button,
  Calendar,
  Label,
  Popover,
  Select,
} from '@/shared/components/ui';

interface DateTimePickerProps {
  label: string;
  date: Date | undefined;
  time: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  datePlaceholder?: string;
  required?: boolean;
  className?: string;
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
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateSelect(selectedDate);
    if (selectedDate) {
      setOpen(false);
    }
  };

  const [hour = '00', minute = '00'] = (time || '00:00').split(':');

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
    []
  );

  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
    []
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label required={required}>{label}</Label>
      <div className='flex gap-2'>
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              variant='outline'
              className='border-input flex-1 justify-between text-left font-normal'
            >
              {date ? (
                format(date, 'yyyy-MM-dd')
              ) : (
                <span className='text-muted-foreground'>{datePlaceholder}</span>
              )}
              <ChevronDownIcon />
            </Button>
          </Popover.Trigger>
          <Popover.Content className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date}
              onSelect={handleDateSelect}
              defaultMonth={date || new Date()}
              initialFocus
            />
          </Popover.Content>
        </Popover>

        <div className='flex flex-1 items-center gap-2'>
          <Select
            value={hour}
            onValueChange={(newHour) => onTimeChange(`${newHour}:${minute}`)}
          >
            <Select.Trigger className='flex-1' size='default'>
              <Select.Value placeholder='시' />
            </Select.Trigger>
            <Select.Content className='max-h-50 overflow-y-auto'>
              {hours.map((h) => (
                <Select.Item key={h} value={h}>
                  {h}시
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Select
            value={minute}
            onValueChange={(newMinute) => onTimeChange(`${hour}:${newMinute}`)}
          >
            <Select.Trigger className='flex-1' size='default'>
              <Select.Value placeholder='분' />
            </Select.Trigger>
            <Select.Content className='max-h-50 overflow-y-auto'>
              {minutes.map((m) => (
                <Select.Item key={m} value={m}>
                  {m}분
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>
    </div>
  );
}
