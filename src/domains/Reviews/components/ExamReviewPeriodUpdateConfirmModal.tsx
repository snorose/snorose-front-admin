import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { ScheduleEditModal } from '@/shared/components';
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
    if (!selectedItem) return;

    if (
      title === '' ||
      startDateTime.dateTime === '' ||
      endDateTime.dateTime === ''
    ) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

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
    }
  };

  return (
    <ScheduleEditModal
      open={isUpdateModalOpen}
      onClose={onClose}
      onSubmit={handleUpdateConfirm}
      title='작성 기간 수정'
      description='시험 후기 작성 기간을 수정하시겠습니까?'
      titleLabel='기간 제목'
      value={title}
      onTitleChange={setTitle}
      startDateTime={startDateTime}
      endDateTime={endDateTime}
    />
  );
}
