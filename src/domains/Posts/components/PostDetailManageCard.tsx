import { Button } from '@/shared/components/ui';

import type { AdminGetPostResponse } from '../types';

interface PostDetailManageCardProps {
  post: AdminGetPostResponse;
  onActionTrigger: (type: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE') => void;
}

export default function PostDetailManageCard({
  post,
  onActionTrigger,
}: PostDetailManageCardProps) {
  const isDeleted =
    post.adminCommonStatuses.includes('ADMIN_DELETED') ||
    post.adminCommonStatuses.includes('USER_DELETED');
  const isVisible = !(
    post.adminCommonStatuses.includes('ADMIN_HIDDEN') ||
    post.adminCommonStatuses.includes('AUTO_HIDDEN') ||
    post.adminCommonStatuses.includes('SANCTIONED')
  );

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
      <h3 className='text-[14px] font-bold text-gray-900'>게시글 관리</h3>
      <div className='flex w-full justify-center'>
        {isDeleted ? (
          <Button
            variant='outline'
            onClick={() => onActionTrigger('RESTORE')}
            className='flex h-10 w-full items-center justify-center rounded-lg border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100'
          >
            게시글 복구
          </Button>
        ) : !isVisible ? (
          <Button
            variant='outline'
            onClick={() => onActionTrigger('SHOW')}
            className='flex h-10 w-full items-center justify-center rounded-lg border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100'
          >
            게시글 공개
          </Button>
        ) : (
          <div className='flex w-full flex-col gap-2'>
            <Button
              variant='outline'
              onClick={() => onActionTrigger('HIDE')}
              className='flex h-10 w-full items-center justify-center rounded-lg border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100'
            >
              게시글 비공개
            </Button>
            <Button
              variant='destructive'
              onClick={() => onActionTrigger('DELETE')}
              className='flex h-10 w-full items-center justify-center rounded-lg bg-red-600 text-[13px] text-white hover:bg-red-700'
            >
              게시글 삭제
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
