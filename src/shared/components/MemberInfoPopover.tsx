import { useState } from 'react';

import { ChevronDown, Loader2, ShieldAlert, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import { DropdownMenu } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import type { MemberInfo } from '@/shared/types';

import { getUserDetailAPI } from '@/apis';

import MemberInfoModal from './MemberInfoModal';
import SanctionModal from './SanctionModal';

interface MemberInfoPopoverProps {
  encryptedUserId: string;
  displayName: string;
  className?: string;
}

export function MemberInfoPopover({
  encryptedUserId,
  displayName,
  className,
}: MemberInfoPopoverProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);

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
    <div className={cn('max-w-full min-w-0', className)}>
      <DropdownMenu open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type='button'
            title={displayName}
            disabled={isFetching}
            aria-busy={isFetching}
            className='group hover:bg-accent focus-visible:ring-ring -mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 cursor-pointer items-center gap-1 rounded-sm px-1 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-wait'
            onClick={(event) => event.stopPropagation()}
          >
            <span className='truncate'>{displayName}</span>
            {isFetching ? (
              <Loader2
                className='text-muted-foreground size-3.5 shrink-0 animate-spin'
                aria-hidden='true'
              />
            ) : (
              <ChevronDown
                className='text-muted-foreground size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none'
                aria-hidden='true'
              />
            )}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align='start'
          sideOffset={4}
          className='w-44 rounded-lg shadow-md'
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu.Item onSelect={() => void handleInfoClick()}>
            <UserRound aria-hidden='true' />
            회원 정보
          </DropdownMenu.Item>
          {/* <DropdownMenu.Item disabled>작성한 게시글</DropdownMenu.Item>
          <DropdownMenu.Item disabled>작성한 댓글</DropdownMenu.Item> */}
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            variant='destructive'
            onSelect={() => void handleSanctionClick()}
          >
            <ShieldAlert aria-hidden='true' />
            제재하기
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

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
