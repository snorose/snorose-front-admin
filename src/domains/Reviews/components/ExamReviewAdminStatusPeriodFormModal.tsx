import { useEffect, useState } from 'react';

import { LoaderCircleIcon } from 'lucide-react';

import { DateTimePicker } from '@/shared/components';
import {
  Button,
  ConfirmModal,
  Dialog,
  Input,
  Label,
} from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import { formatDateTimeWithT, getErrorMessage } from '@/shared/utils';

import type {
  ExamReviewAdminStatusPeriod,
  ExamReviewAdminStatusPeriodInput,
} from '@/domains/Reviews/types';

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
    <div className='flex min-w-0 flex-col gap-4'>
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
        className='grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2'
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

interface ExamReviewAdminStatusPeriodFormModalProps {
  open: boolean;
  period?: ExamReviewAdminStatusPeriod;
  periods: ExamReviewAdminStatusPeriod[];
  isSubmitting: boolean;
  onSubmit: (input: ExamReviewAdminStatusPeriodInput) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onAfterClose: () => void;
}

export function ExamReviewAdminStatusPeriodFormModal({
  open,
  period,
  periods,
  isSubmitting,
  onSubmit,
  onOpenChange,
  onDirtyChange,
  onAfterClose,
}: ExamReviewAdminStatusPeriodFormModalProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  useEffect(() => {
    onDirtyChange(open && isFormDirty);
  }, [open, isFormDirty, onDirtyChange]);

  const closeModal = () => {
    setIsDiscardConfirmOpen(false);
    setIsFormDirty(false);
    onOpenChange(false);
  };

  const requestClose = () => {
    if (isSubmitting) return;
    if (isFormDirty) {
      setIsDiscardConfirmOpen(true);
      return;
    }
    closeModal();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpenChange(true);
        else requestClose();
      }}
    >
      <Dialog.Content
        className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'
        showCloseButton={!isSubmitting}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onAfterClose();
        }}
      >
        <Dialog.Header>
          <Dialog.Title>{period ? '기간 수정' : '기간 추가'}</Dialog.Title>
          <Dialog.Description>
            기간 이름과 시작·종료 일시를 설정해주세요.
          </Dialog.Description>
        </Dialog.Header>
        {open && (
          <PeriodForm
            key={period?.id ?? 'new'}
            period={period}
            periods={periods}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={requestClose}
            onDirtyChange={setIsFormDirty}
          />
        )}
        {isDiscardConfirmOpen && (
          <ConfirmModal
            isOpen
            title='저장하지 않은 변경사항이 있습니다.'
            description='입력한 내용을 저장하지 않고 닫으시겠습니까?'
            confirmText='변경사항 버리기'
            confirmVariant='destructive'
            onConfirm={closeModal}
            onClose={() => setIsDiscardConfirmOpen(false)}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
}
