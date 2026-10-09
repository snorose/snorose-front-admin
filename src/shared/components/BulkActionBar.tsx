import { Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  isVisibilityPending: boolean;
  isDeletePending: boolean;
  isRestoreDisabled?: boolean;
  onBulkVisibility: (visible: boolean) => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
  label: string;
}

export function BulkActionBar({
  selectedCount,
  isVisibilityPending,
  isDeletePending,
  isRestoreDisabled = false,
  onBulkVisibility,
  onBulkRestore,
  onBulkDelete,
  label,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 shadow-sm'>
      <span className='text-sm font-bold text-red-800'>{label} 일괄 처리:</span>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='destructive'
          size='sm'
          disabled={isDeletePending}
          onClick={onBulkDelete}
        >
          <Trash2 className='h-3.5 w-3.5' /> 삭제
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isVisibilityPending || isRestoreDisabled}
          onClick={onBulkRestore}
        >
          <RotateCcw className='h-3.5 w-3.5 text-gray-500' /> 복구
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isVisibilityPending}
          onClick={() => onBulkVisibility(false)}
        >
          <EyeOff className='h-3.5 w-3.5 text-gray-500' /> 비공개
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isVisibilityPending}
          onClick={() => onBulkVisibility(true)}
        >
          <Eye className='h-3.5 w-3.5 text-gray-500' /> 공개
        </Button>
      </div>
    </div>
  );
}
