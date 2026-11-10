import { useNavigate } from 'react-router-dom';

import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

interface MemberInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberInfo: MemberInfo | null;
  encryptedUserId: string;
}

export default function MemberInfoModal({
  isOpen,
  onClose,
  memberInfo,
  encryptedUserId,
}: MemberInfoModalProps) {
  const navigate = useNavigate();
  if (!memberInfo) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className='sm:max-w-md'>
        <Dialog.Header>
          <Dialog.Title>회원 정보</Dialog.Title>
        </Dialog.Header>
        {memberInfo && (
          <div className='grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2.5 py-2 text-sm'>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              이름
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.userName}
            </span>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              아이디
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.loginId}
            </span>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              학번
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.studentNumber}
            </span>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              닉네임
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.nickname}
            </span>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              포인트
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.pointBalance.toLocaleString()}P
            </span>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              경고 이력
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.totalWarningCount}회
            </span>
            <span className='text-muted-foreground shrink-0 text-xs font-medium'>
              강등 이력
            </span>
            <span className='text-foreground min-w-0 text-sm wrap-anywhere whitespace-pre-wrap'>
              {memberInfo.isBlacklist
                ? (memberInfo.blacklistType ?? '강등 중')
                : '없음'}
            </span>
          </div>
        )}
        <Dialog.Footer>
          <Button variant='outline' onClick={onClose}>
            닫기
          </Button>
          <Button
            onClick={() => {
              onClose();
              navigate(`/member/info/${encryptedUserId}`);
            }}
          >
            유저 상세 페이지로 이동
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
