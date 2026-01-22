import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';

interface UseDateTimeFieldOptions {
  initialDate?: Date | undefined;
  initialTime?: string;
  onDateTimeChange?: (dateTime: string) => void;
}

interface UseDateTimeFieldReturn {
  date: Date | undefined;
  time: string;
  dateTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  reset: () => void;
}

export function useDateTimeField({
  initialDate = undefined,
  initialTime = '00:00',
  onDateTimeChange,
}: UseDateTimeFieldOptions = {}): UseDateTimeFieldReturn {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState<string>(initialTime);

  const updateDateTime = useCallback(
    (newDate: Date | undefined, newTime: string) => {
      if (newDate && onDateTimeChange) {
        const dateStr = format(newDate, 'yyyy-MM-dd');
        onDateTimeChange(`${dateStr}T${newTime}`);
      } else if (onDateTimeChange) {
        onDateTimeChange('');
      }
    },
    [onDateTimeChange]
  );

  const handleDateSelect = useCallback(
    (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      updateDateTime(selectedDate, time);
    },
    [time, updateDateTime]
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      setTime(newTime);
      updateDateTime(date, newTime);
    },
    [date, updateDateTime]
  );

  const reset = useCallback(() => {
    setDate(undefined);
    setTime('00:00');
    if (onDateTimeChange) {
      onDateTimeChange('');
    }
  }, [onDateTimeChange]);

  const dateTime = useMemo(() => {
    if (!date) return '';
    const dateStr = format(date, 'yyyy-MM-dd');
    return `${dateStr}T${time}`;
  }, [date, time]);

  return {
    date,
    time,
    dateTime,
    onDateSelect: handleDateSelect,
    onTimeChange: handleTimeChange,
    setDate,
    setTime,
    reset,
  };
}
