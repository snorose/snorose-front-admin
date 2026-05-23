import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/components/ui';

interface CommentBulkActionBarProps {
  selectedCount: number;
  isVisibilityPending: boolean;
  isDeletePending: boolean;
  onBulkVisibility: (visible: boolean) => void;
  onBulkDelete: () => void;
}

export default function CommentBulkActionBar({
  selectedCount,
  isVisibilityPending,
  isDeletePending,
  onBulkVisibility,
  onBulkDelete,
}: CommentBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 shadow-sm'>
      <span className='text-sm font-medium text-red-800'>
        선택된 <strong className='text-red-700'>{selectedCount}</strong>개의
        댓글에 대해 일괄 동작을 적용할 수 있습니다.
      </span>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 border-gray-300 bg-white text-xs'
          disabled={isVisibilityPending}
          onClick={() => onBulkVisibility(true)}
        >
          <Eye className='h-3.5 w-3.5' /> 일괄 공개
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='flex h-8 items-center gap-1 border-gray-300 bg-white text-xs'
          disabled={isVisibilityPending}
          onClick={() => onBulkVisibility(false)}
        >
          <EyeOff className='h-3.5 w-3.5' /> 일괄 비공개
        </Button>
        <Button
          variant='destructive'
          size='sm'
          className='h-8 bg-red-600 text-xs hover:bg-red-700'
          disabled={isDeletePending}
          onClick={onBulkDelete}
        >
          일괄 삭제
        </Button>
      </div>
    </div>
  );
}
