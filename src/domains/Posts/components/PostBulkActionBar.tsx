import { Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui';

interface PostBulkActionBarProps {
  selectedCount: number;
  isVisibilityPending: boolean;
  isDeletePending: boolean;
  onBulkVisibility: (visible: boolean) => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
}

export default function PostBulkActionBar({
  selectedCount,
  isVisibilityPending,
  isDeletePending,
  onBulkVisibility,
  onBulkRestore,
  onBulkDelete,
}: PostBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 shadow-sm'>
      <span className='text-sm font-bold text-red-800'>게시글 일괄 처리:</span>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          variant='destructive'
          size='sm'
          className='flex h-8 items-center gap-1 bg-red-600 text-xs hover:bg-red-700'
          disabled={isDeletePending}
          onClick={onBulkDelete}
        >
          <Trash2 className='h-3.5 w-3.5' /> 삭제
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50'
          disabled={isVisibilityPending}
          onClick={onBulkRestore}
        >
          <RotateCcw className='h-3.5 w-3.5 text-gray-500' /> 복구
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50'
          disabled={isVisibilityPending}
          onClick={() => onBulkVisibility(false)}
        >
          <EyeOff className='h-3.5 w-3.5 text-gray-500' /> 비공개
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50'
          disabled={isVisibilityPending}
          onClick={() => onBulkVisibility(true)}
        >
          <Eye className='h-3.5 w-3.5 text-gray-500' /> 공개
        </Button>
      </div>
    </div>
  );
}
