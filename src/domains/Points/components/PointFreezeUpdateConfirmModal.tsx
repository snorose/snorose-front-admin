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
import { useDateTimeField } from '@/shared/hooks';

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
  const [title, setTitle] = useState('');

  const startDateTime = useDateTimeField();
  const endDateTime = useDateTimeField();

  useEffect(() => {
    if (selectedItem && isUpdateModalOpen) {
      const startAtInput = formatDateTimeForInput(selectedItem.startAt);
      const endAtInput = formatDateTimeForInput(selectedItem.endAt);

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
      await patchPointFreezeAPI(selectedItem.id, {
        title,
        startAt: formatDateTimeForAPI(startDateTime.dateTime),
        endAt: formatDateTimeForAPI(endDateTime.dateTime),
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
