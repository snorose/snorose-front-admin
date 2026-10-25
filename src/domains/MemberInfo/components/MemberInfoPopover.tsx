import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import PenaltyHistoryAddDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog';
import type { AddPenaltyMode } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';

import { getUserDetailAPI } from '@/apis';

interface MemberInfoPopoverProps {
  encryptedUserId: string;
  displayName: string;
}

export function MemberInfoPopover({
  encryptedUserId,
  displayName,
}: MemberInfoPopoverProps) {
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);
  const [penaltyMode, setPenaltyMode] = useState<AddPenaltyMode | null>(null);

  const handleTriggerClick = () => {
    if (!isPopoverOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + 4, left: rect.left });
    }
    setIsPopoverOpen((prev) => !prev);
  };

  const fetchMemberInfo = async (): Promise<MemberInfo | null> => {
    if (memberInfo) return memberInfo;
    if (isFetching) return null;
    setIsFetching(true);
    try {
      const member = await getUserDetailAPI(encryptedUserId);
      setMemberInfo(member);
      return member;
    } catch {
      toast.error('회원 정보를 불러오지 못했습니다.');
      return null;
    } finally {
      setIsFetching(false);
    }
  };

  const handleInfoClick = async () => {
    setIsPopoverOpen(false);
    const member = await fetchMemberInfo();
    if (member) setIsInfoModalOpen(true);
  };

  const handleSanctionClick = async () => {
    setIsPopoverOpen(false);
    const member = await fetchMemberInfo();
    if (member) setIsSanctionModalOpen(true);
  };

  return (
    <div className='min-w-0'>
      <span
        ref={triggerRef}
        onClick={handleTriggerClick}
        title={displayName}
        className='block cursor-pointer truncate transition-colors hover:text-blue-700 hover:underline'
      >
        {displayName}
      </span>

      {isFetching && (
        <Loader2 className='ml-1 inline h-3 w-3 animate-spin text-gray-400' />
      )}

      {isPopoverOpen &&
        createPortal(
          <>
            <div
              className='fixed inset-0 z-40'
              onClick={() => setIsPopoverOpen(false)}
            />
            <div
              className='fixed z-50 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg'
              style={{ top: popoverPos.top, left: popoverPos.left }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50'
                onClick={handleInfoClick}
              >
                회원 정보
              </button>
              <button className='w-full cursor-not-allowed px-3 py-2 text-left text-sm text-gray-400'>
                작성한 게시글
              </button>
              <button className='w-full cursor-not-allowed px-3 py-2 text-left text-sm text-gray-400'>
                작성한 댓글
              </button>
              <div className='border-t border-gray-100' />
              <button
                className='w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50'
                onClick={handleSanctionClick}
              >
                제재하기
              </button>
            </div>
          </>,
          document.body
        )}

      <Modal
        open={isInfoModalOpen}
        onOpenChange={(open) => !open && setIsInfoModalOpen(false)}
        title='회원 정보'
        className='sm:max-w-md'
      >
        {memberInfo && (
          <div className='min-h-0 overflow-y-auto px-6 pb-6'>
            <div className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm wrap-anywhere'>
              <span className='text-gray-700'>이름</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.userName}
              </span>
              <span className='text-gray-700'>아이디</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.loginId}
              </span>
              <span className='text-gray-700'>학번</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.studentNumber}
              </span>
              <span className='text-gray-700'>닉네임</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.nickname}
              </span>
              <span className='text-gray-700'>포인트</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.pointBalance.toLocaleString()}P
              </span>
              <span className='text-gray-700'>경고 이력</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.totalWarningCount}회
              </span>
              <span className='text-gray-700'>강등 이력</span>
              <span className='font-medium text-gray-900'>
                {memberInfo.isBlacklist
                  ? (memberInfo.blacklistType ?? '강등 중')
                  : '없음'}
              </span>
            </div>
            <div className='mt-5 flex justify-end gap-2 border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsInfoModalOpen(false)}
              >
                닫기
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setIsInfoModalOpen(false);
                  navigate(`/member/info/${encryptedUserId}`);
                }}
              >
                유저 상세 페이지로 이동
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isSanctionModalOpen}
        onOpenChange={(open) => !open && setIsSanctionModalOpen(false)}
        title='제재 유형 선택'
        subtitle={`${memberInfo?.userName ?? displayName}님에게 적용할 제재 유형을 선택하세요.`}
        className='sm:max-w-xs'
      >
        <div className='px-6 pb-6'>
          <div className='flex gap-3'>
            <Button
              type='button'
              className='flex-1'
              variant='outline'
              onClick={() => {
                setIsSanctionModalOpen(false);
                setPenaltyMode('WARNING');
              }}
            >
              경고
            </Button>
            <Button
              type='button'
              variant='destructive-outline'
              className='flex-1'
              onClick={() => {
                setIsSanctionModalOpen(false);
                setPenaltyMode('DEMOTION');
              }}
            >
              강등
            </Button>
          </div>
        </div>
      </Modal>

      {memberInfo && (
        <PenaltyHistoryAddDialog
          member={memberInfo}
          mode={penaltyMode}
          onOpenChange={(open) => {
            if (!open) setPenaltyMode(null);
          }}
        />
      )}
    </div>
  );
}
