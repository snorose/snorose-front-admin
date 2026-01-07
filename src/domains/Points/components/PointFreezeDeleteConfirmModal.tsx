import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import type { PointFreeze } from '@/types';

interface PointFreezeDeleteConfirmModalProps {
  isDeleteModalOpen: boolean;
  selectedItem: PointFreeze;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
}
export default function PointFreezeDeleteConfirmModal({
  isDeleteModalOpen,
  selectedItem,
  handleDeleteConfirm,
  handleDeleteCancel,
}: PointFreezeDeleteConfirmModalProps) {
  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={handleDeleteCancel}>
      <DialogContent className='max-w-xs sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>일정 삭제</DialogTitle>
          <DialogDescription>
            포인트 미지급 일정을 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3'>
          <ul className='ml-4 flex list-outside list-disc flex-col gap-1'>
            <li>
              <span className='text-sm font-semibold'>일정 제목: </span>
              <span className='text-sm'>{selectedItem?.title}</span>
            </li>
            <li>
              <span className='text-sm font-semibold'>시작 일시: </span>
              <span className='text-sm'>{selectedItem?.startAt}</span>
            </li>
            <li>
              <span className='text-sm font-semibold'>종료 일시: </span>
              <span className='text-sm'>{selectedItem?.endAt}</span>
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleDeleteCancel()}
          >
            취소
          </Button>
          <Button type='button' onClick={handleDeleteConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
