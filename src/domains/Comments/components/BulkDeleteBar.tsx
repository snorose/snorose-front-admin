import { Eye, EyeOff, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui';

interface BulkDeleteBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkToggleVisibility?: () => void;
  visibilityLabel?: '비공개' | '공개';
  onClearSelection: () => void;
}

export default function BulkDeleteBar({
  selectedCount,
  onBulkDelete,
  onBulkToggleVisibility,
  visibilityLabel = '비공개',
  onClearSelection,
}: BulkDeleteBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-md bg-blue-50 px-4 py-2'>
      <span className='text-sm text-blue-700'>{selectedCount}개 선택됨</span>
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
        
        {onBulkToggleVisibility && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
            onClick={onBulkToggleVisibility}
          >
            {visibilityLabel === '비공개' ? (
              <EyeOff className='mr-1 size-4' />
            ) : (
              <Eye className='mr-1 size-4' />
            )}
            일괄 {visibilityLabel}
          </Button>
        )}

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
