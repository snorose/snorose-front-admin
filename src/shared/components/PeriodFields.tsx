import { type ComponentProps, useId } from 'react';

import { Input, Label } from '@/shared/components/ui';

import { DateTimePicker } from './DateTimePicker';

type DateTimeField = Pick<
  ComponentProps<typeof DateTimePicker>,
  'date' | 'time' | 'onDateSelect' | 'onTimeChange'
>;

type PeriodFieldsProps = {
  title: string;
  titleLabel: string;
  onTitleChange: (title: string) => void;
  start: DateTimeField;
  end: DateTimeField;
  disabled?: boolean;
};

/** 기간 입력의 배치만 공유한다. 상태·초기화·검증·요청 변환은 호출부에서 관리한다. */
export function PeriodFields({
  title,
  titleLabel,
  onTitleChange,
  start,
  end,
  disabled = false,
}: PeriodFieldsProps) {
  const titleId = useId();

  return (
    <div className='min-w-0 space-y-4'>
      <div className='flex flex-col gap-1'>
        <Label htmlFor={titleId} className='text-sm font-semibold'>
          {titleLabel}:
        </Label>
        <Input
          id={titleId}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      <DateTimePicker
        label='시작 일시'
        datePlaceholder='시작 날짜 선택'
        date={start.date}
        time={start.time}
        onDateSelect={start.onDateSelect}
        onTimeChange={start.onTimeChange}
        disabled={disabled}
      />
      <DateTimePicker
        label='종료 일시'
        datePlaceholder='종료 날짜 선택'
        date={end.date}
        time={end.time}
        onDateSelect={end.onDateSelect}
        onTimeChange={end.onTimeChange}
        disabled={disabled}
      />
    </div>
  );
}
