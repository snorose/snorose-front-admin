import { useEffect, useState } from 'react';

import {
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import { DateTimePicker } from '@/shared/components';
import { Button, ConfirmModal, Input, Label } from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import {
  formatDateTimeToMinutes,
  formatDateTimeWithT,
  getErrorMessage,
} from '@/shared/utils';

import type {
  ExamReviewAdminStatusPeriod,
  ExamReviewAdminStatusPeriodInput,
} from '@/domains/Reviews/types';

type EditorState =
  | { type: 'create' }
  | { type: 'update'; period: ExamReviewAdminStatusPeriod }
  | null;

interface PeriodFormProps {
  period?: ExamReviewAdminStatusPeriod;
  periods: ExamReviewAdminStatusPeriod[];
  isSubmitting: boolean;
  onSubmit: (input: ExamReviewAdminStatusPeriodInput) => Promise<void>;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function PeriodForm({
  period,
  periods,
  isSubmitting,
  onSubmit,
  onCancel,
  onDirtyChange,
}: PeriodFormProps) {
  const [title, setTitle] = useState(period?.title ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const startDateTime = useDateTimeField({
    initialDateTime: period?.startAt,
  });
  const endDateTime = useDateTimeField({
    initialDateTime: period?.endAt,
  });
  const initialStartAt = period?.startAt.slice(0, 16) ?? '';
  const initialEndAt = period?.endAt.slice(0, 16) ?? '';
  const isDirty = period
    ? title !== period.title ||
      startDateTime.dateTime !== initialStartAt ||
      endDateTime.dateTime !== initialEndAt
    : Boolean(title || startDateTime.date || endDateTime.date);

  useEffect(() => {
    onDirtyChange(isDirty);
    return () => onDirtyChange(false);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || !startDateTime.dateTime || !endDateTime.dateTime) {
      setErrorMessage('기간 이름과 시작·종료 일시를 모두 입력해주세요.');
      return;
    }

    if (
      new Date(startDateTime.dateTime).getTime() >=
      new Date(endDateTime.dateTime).getTime()
    ) {
      setErrorMessage('종료 일시는 시작 일시보다 늦어야 합니다.');
      return;
    }

    const hasDuplicateTitle = periods.some(
      (item) => item.id !== period?.id && item.title.trim() === trimmedTitle
    );

    if (hasDuplicateTitle) {
      setErrorMessage('같은 이름의 기간이 이미 등록되어 있습니다.');
      return;
    }

    setErrorMessage('');

    try {
      await onSubmit({
        title: trimmedTitle,
        startAt: formatDateTimeWithT(startDateTime.dateTime),
        endAt: formatDateTimeWithT(endDateTime.dateTime),
      });
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, '기간을 저장하는 중 오류가 발생했습니다.')
      );
    }
  };

  return (
    <div className='bg-muted/40 flex flex-col gap-4 rounded-lg border p-4'>
      <div className='flex flex-col gap-1'>
        <Label
          htmlFor={`admin-status-period-title-${period?.id ?? 'new'}`}
          required
        >
          기간 이름
        </Label>
        <Input
          id={`admin-status-period-title-${period?.id ?? 'new'}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='예: 2026-2학기 기말고사'
          disabled={isSubmitting}
          aria-invalid={Boolean(errorMessage)}
        />
      </div>

      <fieldset
        disabled={isSubmitting}
        className='grid min-w-0 gap-4 border-0 p-0 lg:grid-cols-2'
      >
        <DateTimePicker
          label='시작 일시'
          date={startDateTime.date}
          time={startDateTime.time}
          onDateSelect={startDateTime.onDateSelect}
          onTimeChange={startDateTime.onTimeChange}
          datePlaceholder='시작 날짜 선택'
          required
        />
        <DateTimePicker
          label='종료 일시'
          date={endDateTime.date}
          time={endDateTime.time}
          onDateSelect={endDateTime.onDateSelect}
          onTimeChange={endDateTime.onTimeChange}
          datePlaceholder='종료 날짜 선택'
          required
        />
      </fieldset>

      {errorMessage && (
        <p role='alert' className='text-destructive text-sm'>
          {errorMessage}
        </p>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type='button'
          size='sm'
          onClick={handleSubmit}
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting && <LoaderCircleIcon className='animate-spin' />}
          저장
        </Button>
      </div>
    </div>
  );
}

interface ExamReviewAdminStatusPeriodEditorProps {
  periods: ExamReviewAdminStatusPeriod[];
  isSubmitting: boolean;
  onCreate: (
    input: ExamReviewAdminStatusPeriodInput
  ) => Promise<ExamReviewAdminStatusPeriod>;
  onUpdate: (
    periodId: number,
    input: ExamReviewAdminStatusPeriodInput
  ) => Promise<ExamReviewAdminStatusPeriod>;
  onDelete: (periodId: number) => Promise<number>;
  onSelectPeriod: (periodId: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export function ExamReviewAdminStatusPeriodEditor({
  periods,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
  onSelectPeriod,
  onDirtyChange,
}: ExamReviewAdminStatusPeriodEditorProps) {
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ExamReviewAdminStatusPeriod | null>(null);

  useEffect(() => {
    if (!editor) onDirtyChange(false);
  }, [editor, onDirtyChange]);

  const handleCreate = async (input: ExamReviewAdminStatusPeriodInput) => {
    const createdPeriod = await onCreate(input);
    onSelectPeriod(createdPeriod.id);
    setEditor(null);
    toast.success('현황 집계 기간을 추가했습니다.');
  };

  const handleUpdate = async (
    periodId: number,
    input: ExamReviewAdminStatusPeriodInput
  ) => {
    await onUpdate(periodId, input);
    onSelectPeriod(periodId);
    setEditor(null);
    toast.success('현황 집계 기간을 수정했습니다.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('현황 집계 기간을 삭제했습니다.');
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '기간을 삭제하는 중 오류가 발생했습니다.')
      );
    }
  };

  return (
    <section className='flex flex-col gap-4'>
      <div className='overflow-hidden rounded-lg border'>
        <div className='bg-muted/50 hidden grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] gap-4 border-b px-4 py-2 text-sm font-semibold md:grid'>
          <span>기간 이름</span>
          <span>시작 일시</span>
          <span>종료 일시</span>
          <span className='w-20 text-center'>관리</span>
        </div>

        <div className='divide-y'>
          {periods.length === 0 && editor?.type !== 'create' && (
            <div className='text-muted-foreground px-4 py-10 text-center text-sm'>
              등록된 현황 집계 기간이 없습니다.
            </div>
          )}

          {periods.map((period) =>
            editor?.type === 'update' && editor.period.id === period.id ? (
              <div key={period.id} className='p-3'>
                <PeriodForm
                  key={period.id}
                  period={period}
                  periods={periods}
                  isSubmitting={isSubmitting}
                  onSubmit={(input) => handleUpdate(period.id, input)}
                  onCancel={() => setEditor(null)}
                  onDirtyChange={onDirtyChange}
                />
              </div>
            ) : (
              <div
                key={period.id}
                className='grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] md:items-center md:gap-4'
              >
                <strong className='truncate text-sm'>{period.title}</strong>
                <div className='text-muted-foreground text-sm'>
                  <span className='mr-2 font-medium md:hidden'>시작</span>
                  {formatDateTimeToMinutes(period.startAt)}
                </div>
                <div className='text-muted-foreground text-sm'>
                  <span className='mr-2 font-medium md:hidden'>종료</span>
                  {formatDateTimeToMinutes(period.endAt)}
                </div>
                <div className='flex justify-end gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    aria-label={`${period.title} 수정`}
                    onClick={() => setEditor({ type: 'update', period })}
                    disabled={Boolean(editor) || isSubmitting}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    className='text-destructive hover:text-destructive'
                    aria-label={`${period.title} 삭제`}
                    onClick={() => setDeleteTarget(period)}
                    disabled={Boolean(editor) || isSubmitting}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            )
          )}

          {editor?.type === 'create' && (
            <div className='p-3'>
              <PeriodForm
                periods={periods}
                isSubmitting={isSubmitting}
                onSubmit={handleCreate}
                onCancel={() => setEditor(null)}
                onDirtyChange={onDirtyChange}
              />
            </div>
          )}
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        className='self-start'
        onClick={() => setEditor({ type: 'create' })}
        disabled={Boolean(editor) || isSubmitting}
      >
        <PlusIcon />
        기간 추가
      </Button>

      {deleteTarget && (
        <ConfirmModal
          isOpen
          title='현황 집계 기간 삭제'
          description='이 기간 설정만 삭제되며 시험후기 원본과 확인 이력은 유지됩니다.'
          confirmText='삭제'
          confirmButtonClassName='bg-destructive text-white hover:bg-destructive/90'
          confirmDisabled={isSubmitting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        >
          <div className='bg-muted/50 rounded-md p-3 text-sm'>
            <p className='font-semibold'>{deleteTarget.title}</p>
            <p className='text-muted-foreground mt-1'>
              {formatDateTimeToMinutes(deleteTarget.startAt)} ~{' '}
              {formatDateTimeToMinutes(deleteTarget.endAt)}
            </p>
          </div>
        </ConfirmModal>
      )}
    </section>
  );
}
