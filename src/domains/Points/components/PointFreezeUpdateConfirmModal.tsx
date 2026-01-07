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
import { patchPointFreezeAPI } from '@/apis';
import { toast } from 'sonner';
import type { PointFreeze } from '@/types';
import { useState, useEffect } from 'react';
import {
  getErrorMessage,
  formatDateTimeForAPI,
  formatDateTimeForInput,
} from '@/utils';

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

  useEffect(() => {
    if (selectedItem && isUpdateModalOpen) {
      setUpdateFormData({
        title: selectedItem.title,
        startAt: formatDateTimeForInput(selectedItem.startAt),
        endAt: formatDateTimeForInput(selectedItem.endAt),
      });
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
        <div className='flex flex-col gap-1'>
          <Label className='text-sm font-semibold'>시작 일시: </Label>
          <Input
            type='datetime-local'
            id='startAt'
            value={updateFormData.startAt}
            onChange={handleInputChange}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-sm font-semibold'>종료 일시: </Label>
          <Input
            type='datetime-local'
            id='endAt'
            value={updateFormData.endAt}
            onChange={handleInputChange}
          />
        </div>
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
