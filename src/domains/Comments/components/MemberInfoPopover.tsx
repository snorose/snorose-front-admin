import { useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import type { MemberInfo } from '@/shared/types';


interface MemberInfoPopoverProps {
  encryptedUserId: string;
  popoverUser: MemberInfo | null;
  isUserLoading: boolean;
  onClose: () => void;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export default function MemberInfoPopover({
  encryptedUserId,
  popoverUser,
  isUserLoading,
  onClose,
  onPageChange,
}: MemberInfoPopoverProps) {
  const navigate = useNavigate();

  return (
    <div
      className='absolute left-3 top-10 z-50 w-72 rounded-lg border border-gray-250 bg-white p-4 shadow-xl text-xs text-gray-700 font-normal leading-relaxed'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='flex justify-between items-center border-b border-gray-100 pb-2 mb-2'>
        <span className='font-bold text-gray-900'>미니 회원 정보</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className='p-0.5 hover:bg-gray-100 rounded'
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
          <div className='grid grid-cols-2 gap-y-1 gap-x-2 text-gray-600 border-b border-gray-50 pb-2 mb-1'>
            <div>
              이름:{' '}
              <strong className='text-gray-900'>
                {popoverUser.userName || '미정'}
              </strong>
            </div>
            <div>
              아이디:{' '}
              <strong className='text-gray-900 font-mono'>
                {popoverUser.loginId || '미정'}
              </strong>
            </div>
            <div>
              학번:{' '}
              <strong className='text-gray-900 font-mono'>
                {popoverUser.studentNumber || '미정'}
              </strong>
            </div>
            <div>
              포인트:{' '}
              <strong className='text-blue-600 font-bold'>
                {popoverUser.pointBalance || 0} P
              </strong>
            </div>
            <div>
              강등이력:{' '}
              <strong
                className={
                  popoverUser.isBlacklist
                    ? 'text-red-600 font-semibold'
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
                    ? 'text-red-600 font-semibold'
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
              onPageChange(1);
              const params = new URLSearchParams();
              params.set('encryptedUserId', encryptedUserId);
              navigate(`?${params.toString()}`, { replace: true });
            }}
            className='w-full py-1 text-left hover:bg-blue-50 hover:text-blue-700 px-2 rounded text-gray-800 font-medium'
          >
            작성한 댓글 검색 조회
          </button>
        </div>
      ) : (
        <p className='text-gray-400 text-center py-2'>사용자 상세 조회 실패</p>
      )}
    </div>
  );
}
