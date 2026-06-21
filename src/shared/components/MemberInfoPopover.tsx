import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { MemberInfo } from '@/shared/types';

import { getUserDetailAPI } from '@/apis';

import MemberInfoModal from './MemberInfoModal';
import SanctionModal from './SanctionModal';

interface MemberInfoPopoverProps {
  encryptedUserId: string;
  displayName: string;
}

export default function MemberInfoPopover({
  encryptedUserId,
  displayName,
}: MemberInfoPopoverProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);

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
    <div>
      <span
        ref={triggerRef}
        onClick={handleTriggerClick}
        className='cursor-pointer truncate transition-colors hover:text-blue-700 hover:underline'
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
              onClick={(e) => e.stopPropagation()}
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

      <MemberInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        memberInfo={memberInfo}
        encryptedUserId={encryptedUserId}
      />

      <SanctionModal
        isOpen={isSanctionModalOpen}
        onClose={() => setIsSanctionModalOpen(false)}
        memberInfo={memberInfo}
      />
    </div>
  );
}
