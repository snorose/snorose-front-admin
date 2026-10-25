import { useEffect, useId, useState } from 'react';

import { toast } from 'sonner';

import { DateTimePicker } from '@/shared/components';
import { Modal } from '@/shared/components/Modal';
import { Button, Input, Label } from '@/shared/components/ui';
import { useDateTimeField } from '@/shared/hooks';
import type { PointFreeze } from '@/shared/types';
import { getErrorMessage, toDateTimeInputValue } from '@/shared/utils';

import { useUpdatePointFreeze } from '@/domains/Points/hooks';
import { updatePointFreezeRequest } from '@/domains/Points/utils';

interface PointFreezeUpdateConfirmModalProps {
  isUpdateModalOpen: boolean;
  selectedItem: PointFreeze;
  onClose: () => void;
}

export function PointFreezeUpdateConfirmModal({
  isUpdateModalOpen,
  selectedItem,
  onClose,
}: PointFreezeUpdateConfirmModalProps) {
  const { mutateAsync, isPending } = useUpdatePointFreeze();
  const titleId = useId();
  const [title, setTitle] = useState('');

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

    try {
      await mutateAsync({
        id: selectedItem.id,
        data: updatePointFreezeRequest({
          title,
          startAt: startDateTime.dateTime,
          endAt: endDateTime.dateTime,
        }),
      });
      toast.success('미지급 일정 수정이 완료되었어요.');
      onClose();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        '미지급 일정 수정에 실패했습니다.'
      );
      toast.error(errorMessage);
    }
  };

  const handleUpdateCancel = () => {
    onClose();
  };

  return (
    <Modal
      open={isUpdateModalOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title='일정 수정'
      subtitle='포인트 미지급 일정을 수정하시겠습니까?'
      size='sm'
      closeDisabled={isPending}
    >
      <fieldset
        disabled={isPending}
        className='min-h-0 min-w-0 space-y-4 overflow-y-auto px-6 pb-6'
      >
        <div className='flex flex-col gap-1'>
          <Label htmlFor={titleId} className='text-sm font-semibold'>
            일정 제목:
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
          <Button type='button' variant='outline' onClick={handleUpdateCancel}>
            취소
          </Button>
          <Button
            type='button'
            disabled={isPending}
            onClick={handleUpdateConfirm}
          >
            {isPending ? '수정 중' : '수정'}
          </Button>
        </div>
      </fieldset>
    </Modal>
  );
}
