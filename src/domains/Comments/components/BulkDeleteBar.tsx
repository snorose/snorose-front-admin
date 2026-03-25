import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui';

interface BulkDeleteBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function BulkDeleteBar({
  selectedCount,
  onBulkDelete,
  onClearSelection,
}: BulkDeleteBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-md bg-blue-50 px-4 py-2'>
      <span className='text-sm text-blue-700'>
        {selectedCount}개 선택됨
      </span>
      <div className='flex gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-gray-500'
          onClick={onClearSelection}
        >
          선택 해제
        </Button>
        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={onBulkDelete}
        >
          <Trash2 className='mr-1 size-4' />
          일괄 삭제
        </Button>
      </div>
    </div>
  );
}
