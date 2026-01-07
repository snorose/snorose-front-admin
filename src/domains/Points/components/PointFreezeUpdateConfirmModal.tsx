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
      const formatDateTime = (dateTimeString: string) => {
        return dateTimeString.replace(' ', 'T').slice(0, 16);
      };

      setUpdateFormData({
        title: selectedItem.title,
        startAt: formatDateTime(selectedItem.startAt),
        endAt: formatDateTime(selectedItem.endAt),
      });
    }
  }, [selectedItem, isUpdateModalOpen]);

  const handleTitleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateFormData({ ...updateFormData, title: e.target.value });
  };

  const handleStartDateUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUpdateFormData({ ...updateFormData, startAt: e.target.value });
  };

  const handleEndDateUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUpdateFormData({ ...updateFormData, endAt: e.target.value });
  };

  const handleUpdateConfirm = async () => {
    if (!selectedItem) return;

    const formatDateTime = (dateTimeString: string) => {
      return dateTimeString.replace('T', ' ') + ':00';
    };

    try {
      await patchPointFreezeAPI(selectedItem.id, {
        title: updateFormData.title,
        startAt: formatDateTime(updateFormData.startAt),
        endAt: formatDateTime(updateFormData.endAt),
      });
      toast.success('미지급 일정 수정이 완료되었어요.');
      onClose();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error?.response?.data?.message || '미지급 일정 수정에 실패했습니다.';
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
            onChange={handleTitleUpdateChange}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-sm font-semibold'>시작 일시: </Label>
          <Input
            type='datetime-local'
            id='startDate'
            value={updateFormData.startAt}
            onChange={handleStartDateUpdateChange}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-sm font-semibold'>종료 일시: </Label>
          <Input
            type='datetime-local'
            id='endDate'
            value={updateFormData.endAt}
            onChange={handleEndDateUpdateChange}
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
