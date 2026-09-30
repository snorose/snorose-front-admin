import { useState } from 'react';

import { Button, Input, Label } from '@/shared/components/ui';

import type { ServerMaintenance } from '../types/maintenance';

export type MaintenanceDraft = Pick<
  ServerMaintenance,
  'title' | 'startAt' | 'endAt'
>;

const EMPTY_DRAFT: MaintenanceDraft = { title: '', startAt: '', endAt: '' };

interface Props {
  initial?: ServerMaintenance;
  onSave: (draft: MaintenanceDraft) => void;
  onCancel?: () => void;
}

export function MaintenanceScheduleForm({ initial, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<MaintenanceDraft>(initial ?? EMPTY_DRAFT);
  const [error, setError] = useState('');

  const reset = () => {
    setDraft(initial ?? EMPTY_DRAFT);
    setError('');
  };

  return (
    <section
      className='flex flex-col gap-1'
      aria-labelledby='maintenance-form-title'
    >
      <h2 id='maintenance-form-title' className='text-lg font-bold'>
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
          <Label htmlFor='maintenance-title' required>
            일정 제목
          </Label>
          <Input
            id='maintenance-title'
            placeholder='예: 정기 서버점검'
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
            maxLength={100}
            required
          />
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='maintenance-start' required>
              시작 일시
            </Label>
            <Input
              id='maintenance-start'
              type='datetime-local'
              value={draft.startAt}
              onChange={(event) =>
                setDraft({ ...draft, startAt: event.target.value })
              }
              required
              aria-describedby={error ? 'maintenance-error' : undefined}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='maintenance-end' required>
              종료 일시
            </Label>
            <Input
              id='maintenance-end'
              type='datetime-local'
              value={draft.endAt}
              onChange={(event) =>
                setDraft({ ...draft, endAt: event.target.value })
              }
              required
              aria-describedby={error ? 'maintenance-error' : undefined}
            />
          </div>
        </div>
        {error && (
          <p
            id='maintenance-error'
            role='alert'
            className='text-destructive text-sm'
          >
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
