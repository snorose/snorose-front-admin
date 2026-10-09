import { useId, useState } from 'react';

import { DateTimePicker } from '@/shared/components';
import { Button, Input, Label } from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';

import type { ServerMaintenance } from '../types/maintenance';

export type MaintenanceDraft = Pick<
  ServerMaintenance,
  'title' | 'startAt' | 'endAt'
>;

interface Props {
  initial?: ServerMaintenance;
  onSave: (draft: MaintenanceDraft) => void;
  onCancel?: () => void;
}

export function MaintenanceScheduleForm({ initial, onSave, onCancel }: Props) {
  const id = useId();
  const titleId = `${id}-title`;
  const headingId = `${id}-heading`;
  const errorId = `${id}-error`;
  const [title, setTitle] = useState(initial?.title ?? '');
  const start = useDateTimeField({ initialDateTime: initial?.startAt });
  const end = useDateTimeField({ initialDateTime: initial?.endAt });
  const draft: MaintenanceDraft = {
    title,
    startAt: start.dateTime,
    endAt: end.dateTime,
  };
  const [error, setError] = useState('');

  const reset = () => {
    setTitle(initial?.title ?? '');
    start.setDateTime(initial?.startAt ?? '');
    end.setDateTime(initial?.endAt ?? '');
    setError('');
  };

  return (
    <section className='flex flex-col gap-1' aria-labelledby={headingId}>
      <h2 id={headingId} className='text-lg font-bold'>
        {initial ? '서버 점검 일정 수정' : '서버 점검 일정 등록'}
      </h2>
      <form
        className='flex flex-col gap-4 rounded-md border p-4 pb-5'
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.title.trim() || !draft.startAt || !draft.endAt) {
            setError('모든 필수 항목을 입력해 주세요.');
            return;
          }
          if (
            !Number.isFinite(new Date(draft.startAt).getTime()) ||
            !Number.isFinite(new Date(draft.endAt).getTime()) ||
            draft.endAt <= draft.startAt
          ) {
            setError('종료 일시는 시작 일시보다 늦어야 합니다.');
            return;
          }
          onSave({ ...draft, title: draft.title.trim() });
          reset();
        }}
      >
        <div className='flex flex-col gap-1'>
          <Label htmlFor={titleId} required>
            일정 제목
          </Label>
          <Input
            id={titleId}
            placeholder='예: 정기 서버점검'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <DateTimePicker
            label='시작 일시'
            date={start.date}
            time={start.time}
            onDateSelect={start.onDateSelect}
            onTimeChange={start.onTimeChange}
            datePlaceholder='시작 날짜 선택'
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
          <DateTimePicker
            label='종료 일시'
            date={end.date}
            time={end.time}
            onDateSelect={end.onDateSelect}
            onTimeChange={end.onTimeChange}
            datePlaceholder='종료 날짜 선택'
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        {error && (
          <p id={errorId} role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        <div className='flex justify-end gap-2'>
          {initial && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={onCancel}
            >
              취소
            </Button>
          )}
          <Button type='button' size='sm' variant='outline' onClick={reset}>
            초기화
          </Button>
          <Button type='submit' size='sm'>
            {initial ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </section>
  );
}
