import {
  Label,
  Input,
  Button,
  Calendar,
  Popover,
} from '@/shared/components/ui';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

interface DateTimePickerProps {
  label: string;
  date: Date | undefined;
  time: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        <Input
          type='time'
          step='60'
          value={time}
          onChange={onTimeChange}
          className='bg-background flex-1 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
        />
      </div>
    </div>
  );
}
