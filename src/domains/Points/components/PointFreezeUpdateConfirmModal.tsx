import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { ScheduleEditModal } from '@/shared/components';
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

  return (
    <ScheduleEditModal
      open={isUpdateModalOpen}
      onClose={onClose}
      onSubmit={handleUpdateConfirm}
      title='일정 수정'
      description='포인트 미지급 일정을 수정하시겠습니까?'
      titleLabel='일정 제목'
      value={title}
      onTitleChange={setTitle}
      startDateTime={startDateTime}
      endDateTime={endDateTime}
      isPending={isPending}
    />
  );
}
