import { useEffect, useId, useState } from 'react';

import { toast } from 'sonner';

import { DateTimePicker } from '@/shared/components';
import { Modal } from '@/shared/components/Modal';
import { Button, Input, Label } from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import type { ExamReviewPeriod } from '@/shared/types';
import { getErrorMessage, toDateTimeInputValue } from '@/shared/utils';

import { updateExamReviewPeriodRequest } from '@/domains/Reviews/utils';

import { patchExamReviewPeriodAPI } from '@/apis';

interface ExamReviewPeriodUpdateConfirmModalProps {
  isUpdateModalOpen: boolean;
  selectedItem: ExamReviewPeriod;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExamReviewPeriodUpdateConfirmModal({
  isUpdateModalOpen,
  selectedItem,
  onClose,
  onSuccess,
}: ExamReviewPeriodUpdateConfirmModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState('');
  const [isPending, setIsPending] = useState(false);

  const startDateTime = useDateTimeField();
  const endDateTime = useDateTimeField();

  useEffect(() => {
    if (selectedItem && isUpdateModalOpen) {
      const startAtInput = toDateTimeInputValue(selectedItem.startAt);
      const endAtInput = toDateTimeInputValue(selectedItem.endAt);

      setTitle(selectedItem.title);
      startDateTime.setDateTime(startAtInput);
      endDateTime.setDateTime(endAtInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, isUpdateModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleUpdateConfirm = async () => {
    if (!selectedItem || isPending) return;

    if (
      title === '' ||
      startDateTime.dateTime === '' ||
      endDateTime.dateTime === ''
    ) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsPending(true);
    try {
      await patchExamReviewPeriodAPI(
        selectedItem.id,
        updateExamReviewPeriodRequest({
          title,
          startAt: startDateTime.dateTime,
          endAt: endDateTime.dateTime,
        })
      );
      toast.success('시험 후기 작성 기간 수정이 완료되었어요.');
      onClose();
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '시험 후기 작성 기간 수정에 실패했습니다.')
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      open={isUpdateModalOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title='작성 기간 수정'
      subtitle='시험 후기 작성 기간을 수정하시겠습니까?'
      size='sm'
      closeDisabled={isPending}
    >
      <fieldset
        disabled={isPending}
        className='min-h-0 min-w-0 space-y-4 overflow-y-auto px-6 pb-6'
      >
        <div className='flex flex-col gap-1'>
          <Label htmlFor={titleId} className='text-sm font-semibold'>
            기간 제목:
          </Label>
          <Input
            type='text'
            id={titleId}
            value={title}
            onChange={handleInputChange}
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
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={onClose}>
            취소
          </Button>
          <Button type='button' onClick={handleUpdateConfirm}>
            {isPending ? '수정 중' : '수정'}
          </Button>
        </div>
      </fieldset>
    </Modal>
  );
}
