import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Input,
} from '@/components/ui';
import { DateTimePicker } from '@/components';
import { patchPointFreezeAPI } from '@/apis';
import { toast } from 'sonner';
import type { PointFreeze } from '@/types';
import { useState, useEffect } from 'react';
import {
  getErrorMessage,
  formatDateTimeForAPI,
  formatDateTimeForInput,
} from '@/utils';
import { useDateTimeField } from '@/hooks';

interface PointFreezeUpdateConfirmModalProps {
  isUpdateModalOpen: boolean;
  selectedItem: PointFreeze;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PointFreezeUpdateConfirmModal({
  isUpdateModalOpen,
  selectedItem,
  onClose,
  onSuccess,
}: PointFreezeUpdateConfirmModalProps) {
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    startAt: '',
    endAt: '',
  });

  const startDateTime = useDateTimeField({
    onDateTimeChange: (dateTime) => {
      setUpdateFormData((prev) => ({ ...prev, startAt: dateTime }));
    },
  });

  const endDateTime = useDateTimeField({
    onDateTimeChange: (dateTime) => {
      setUpdateFormData((prev) => ({ ...prev, endAt: dateTime }));
    },
  });

  useEffect(() => {
    if (selectedItem && isUpdateModalOpen) {
      const startAtInput = formatDateTimeForInput(selectedItem.startAt);
      const endAtInput = formatDateTimeForInput(selectedItem.endAt);

      // '2024-01-01T12:00' 형식을 파싱
      const startDateTimeParts = startAtInput.split('T');
      const endDateTimeParts = endAtInput.split('T');

      const startDateValue = startDateTimeParts[0]
        ? new Date(startDateTimeParts[0])
        : undefined;
      const endDateValue = endDateTimeParts[0]
        ? new Date(endDateTimeParts[0])
        : undefined;

      setUpdateFormData({
        title: selectedItem.title,
        startAt: startAtInput,
        endAt: endAtInput,
      });
      startDateTime.setDate(startDateValue);
      startDateTime.setTime(startDateTimeParts[1] || '00:00');
      endDateTime.setDate(endDateValue);
      endDateTime.setTime(endDateTimeParts[1] || '00:00');
    }
  }, [selectedItem, isUpdateModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id in updateFormData) {
      setUpdateFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleUpdateConfirm = async () => {
    if (!selectedItem) return;

    try {
      await patchPointFreezeAPI(selectedItem.id, {
        title: updateFormData.title,
        startAt: formatDateTimeForAPI(updateFormData.startAt),
        endAt: formatDateTimeForAPI(updateFormData.endAt),
      });
      toast.success('미지급 일정 수정이 완료되었어요.');
      onClose();
      onSuccess();
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
    <Dialog open={isUpdateModalOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-xs sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
          <DialogDescription>
            포인트 미지급 일정을 수정하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-1'>
          <Label className='text-sm font-semibold'>일정 제목: </Label>
          <Input
            type='text'
            id='title'
            value={updateFormData.title}
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
        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleUpdateCancel}>
            취소
          </Button>
          <Button type='button' onClick={handleUpdateConfirm}>
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
