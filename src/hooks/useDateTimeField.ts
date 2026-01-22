import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';

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
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  // initialDateTime이 제공되면 파싱하여 초기값 설정
  const parseDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return { date: undefined, time: '00:00' };
    const parts = dateTime.split('T');
    return {
      date: parts[0] ? new Date(parts[0]) : undefined,
      time: parts[1] || '00:00',
    };
  };

  const initial = initialDateTime
    ? parseDateTime(initialDateTime)
    : { date: initialDate, time: initialTime };

  const [date, setDate] = useState<Date | undefined>(initial.date);
  const [time, setTime] = useState<string>(initial.time);

  const dateTime = useMemo(() => {
    if (!date) return '';
    const dateStr = format(date, 'yyyy-MM-dd');
    return `${dateStr}T${time}`;
  }, [date, time]);

  const updateDateTime = useCallback(
    (newDate: Date | undefined, newTime: string) => {
      if (newDate) {
        const dateStr = format(newDate, 'yyyy-MM-dd');
        const newDateTime = `${dateStr}T${newTime}`;
        onDateTimeChange?.(newDateTime);
      } else {
        onDateTimeChange?.('');
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

  const setDateTime = useCallback((dateTimeString: string) => {
    const parsed = parseDateTime(dateTimeString);
    setDate(parsed.date);
    setTime(parsed.time);
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
    setDate,
    setTime,
    setDateTime,
    reset,
  };
}
