import { useNavigate } from 'react-router-dom';

import { Loader2, X } from 'lucide-react';

import type { MemberInfo } from '@/shared/types';

interface MemberInfoPopoverProps {
  encryptedUserId: string;
  popoverUser: MemberInfo | null;
  isUserLoading: boolean;
  onClose: () => void;
}

export default function MemberInfoPopover({
  encryptedUserId,
  popoverUser,
  isUserLoading,
  onClose,
}: MemberInfoPopoverProps) {
  const navigate = useNavigate();

  return (
    <div
      className='border-gray-250 absolute top-10 left-3 z-50 w-72 rounded-lg border bg-white p-4 text-xs leading-relaxed font-normal text-gray-700 shadow-xl'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='mb-2 flex items-center justify-between border-b border-gray-100 pb-2'>
        <span className='font-bold text-gray-900'>미니 회원 정보</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className='rounded p-0.5 hover:bg-gray-100'
        >
          <X className='h-3.5 w-3.5 text-gray-400' />
        </button>
      </div>

      {isUserLoading ? (
        <div className='flex justify-center py-4'>
          <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
        </div>
      ) : popoverUser ? (
        <div className='flex flex-col gap-2'>
          <div className='mb-1 grid grid-cols-2 gap-x-2 gap-y-1 border-b border-gray-50 pb-2 text-gray-600'>
            <div>
              이름:{' '}
              <strong className='text-gray-900'>
                {popoverUser.userName || '미정'}
              </strong>
            </div>
            <div>
              아이디:{' '}
              <strong className='font-mono text-gray-900'>
                {popoverUser.loginId || '미정'}
              </strong>
            </div>
            <div>
              학번:{' '}
              <strong className='font-mono text-gray-900'>
                {popoverUser.studentNumber || '미정'}
              </strong>
            </div>
            <div>
              포인트:{' '}
              <strong className='font-bold text-blue-600'>
                {popoverUser.pointBalance || 0} P
              </strong>
            </div>
            <div>
              강등이력:{' '}
              <strong
                className={
                  popoverUser.isBlacklist
                    ? 'font-semibold text-red-600'
                    : 'text-gray-900'
                }
              >
                {popoverUser.isBlacklist ? '있음' : '없음'}
              </strong>
            </div>
            <div>
              경고횟수:{' '}
              <strong
                className={
                  (popoverUser.totalWarningCount ?? 0) > 0
                    ? 'font-semibold text-red-600'
                    : 'text-gray-900'
                }
              >
                {popoverUser.totalWarningCount ?? 0} 회
              </strong>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              const params = new URLSearchParams();
              params.set('encryptedUserId', encryptedUserId);
              navigate(`?${params.toString()}`, { replace: true });
            }}
            className='w-full rounded px-2 py-1 text-left font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700'
          >
            작성한 댓글 검색 조회
          </button>
        </div>
      ) : (
        <p className='py-2 text-center text-gray-400'>사용자 상세 조회 실패</p>
      )}
    </div>
  );
}
