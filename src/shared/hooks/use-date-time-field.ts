import { useCallback, useMemo, useState } from 'react';

import { formatDateValue, parseLocalDateTime } from '@/shared/utils';

interface UseDateTimeFieldOptions {
  initialDate?: Date | undefined;
  initialTime?: string;
  initialDateTime?: string;
  onDateTimeChange?: (dateTime: string) => void;
}

interface UseDateTimeFieldReturn {
  date: Date | undefined;
  time: string;
  dateTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  setDateTime: (dateTime: string) => void;
  reset: () => void;
}

export function useDateTimeField({
  initialDate = undefined,
  initialTime = '00:00',
  initialDateTime,
  onDateTimeChange,
}: UseDateTimeFieldOptions = {}): UseDateTimeFieldReturn {
  const initial = initialDateTime
    ? parseLocalDateTime(initialDateTime)
    : {
        date: formatDateValue(initialDate) ? initialDate : undefined,
        time: initialTime,
      };

  const [date, setDate] = useState<Date | undefined>(initial.date);
  const [time, setTime] = useState<string>(initial.time);

  const dateTime = useMemo(() => {
    const dateStr = formatDateValue(date);
    return dateStr ? `${dateStr}T${time}` : '';
  }, [date, time]);

  const updateDateTime = useCallback(
    (newDate: Date | undefined, newTime: string) => {
      const dateStr = formatDateValue(newDate);
      onDateTimeChange?.(dateStr ? `${dateStr}T${newTime}` : '');
    },
    [onDateTimeChange]
  );

  const handleDateSelect = useCallback(
    (selectedDate: Date | undefined) => {
      setDate(formatDateValue(selectedDate) ? selectedDate : undefined);
      updateDateTime(selectedDate, time);
    },
    [time, updateDateTime]
  );

  const handleTimeChange = useCallback(
    (newTime: string) => {
      setTime(newTime);
      updateDateTime(date, newTime);
    },
    [date, updateDateTime]
  );

  const setDateTime = useCallback((dateTimeString: string) => {
    const parsed = parseLocalDateTime(dateTimeString);
    setDate(parsed.date);
    setTime(parsed.time);
  }, []);

  const setValidDate = useCallback((nextDate: Date | undefined) => {
    setDate(formatDateValue(nextDate) ? nextDate : undefined);
  }, []);

  const reset = useCallback(() => {
    setDate(undefined);
    setTime('00:00');
    onDateTimeChange?.('');
  }, [onDateTimeChange]);

  return {
    date,
    time,
    dateTime,
    onDateSelect: handleDateSelect,
    onTimeChange: handleTimeChange,
    setDate: setValidDate,
    setTime,
    setDateTime,
    reset,
  };
}
