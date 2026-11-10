import { useId } from 'react';

import { Button, Dialog, Input, Label } from '@/shared/components/ui';
import type { useDateTimeField } from '@/shared/hooks';

import { DateTimePicker } from './DateTimePicker';

type DateTimeField = ReturnType<typeof useDateTimeField>;

interface ScheduleEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description: string;
  titleLabel: string;
  value: string;
  onTitleChange: (value: string) => void;
  startDateTime: DateTimeField;
  endDateTime: DateTimeField;
  isPending?: boolean;
}

export function ScheduleEditModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  titleLabel,
  value,
  onTitleChange,
  startDateTime,
  endDateTime,
  isPending = false,
}: ScheduleEditModalProps) {
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Content className='sm:max-w-lg'>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor={titleId}>{titleLabel}</Label>
            <Input
              id={titleId}
              value={value}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>
          <DateTimePicker
            label='시작 일시'
            date={startDateTime.date}
            time={startDateTime.time}
            onDateSelect={startDateTime.onDateSelect}
            onTimeChange={startDateTime.onTimeChange}
            datePlaceholder='시작 날짜 선택'
          />
          <DateTimePicker
            label='종료 일시'
            date={endDateTime.date}
            time={endDateTime.time}
            onDateSelect={endDateTime.onDateSelect}
            onTimeChange={endDateTime.onTimeChange}
            datePlaceholder='종료 날짜 선택'
          />
        </div>
        <Dialog.Footer className='mt-2 grid grid-cols-2 gap-3 sm:grid sm:grid-cols-2 sm:justify-normal'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            className='w-full'
          >
            취소
          </Button>
          <Button
            type='button'
            onClick={onSubmit}
            disabled={isPending}
            className='w-full'
          >
            수정
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
