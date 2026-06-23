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
          <div className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 py-2 text-sm'>
            <span className='text-gray-500'>이름</span>
            <span className='font-medium text-gray-900'>
              {memberInfo.userName}
            </span>
            <span className='text-gray-500'>아이디</span>
            <span className='font-medium text-gray-900'>
              {memberInfo.loginId}
            </span>
            <span className='text-gray-500'>학번</span>
            <span className='font-medium text-gray-900'>
              {memberInfo.studentNumber}
            </span>
            <span className='text-gray-500'>닉네임</span>
            <span className='font-medium text-gray-900'>
              {memberInfo.nickname}
            </span>
            <span className='text-gray-500'>포인트</span>
            <span className='font-medium text-gray-900'>
              {memberInfo.pointBalance.toLocaleString()}P
            </span>
            <span className='text-gray-500'>경고 이력</span>
            <span className='font-medium text-gray-900'>
              {memberInfo.totalWarningCount}회
            </span>
            <span className='text-gray-500'>강등 이력</span>
            <span className='font-medium text-gray-900'>
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
              navigate(`/member/info/${encryptedUserId}`, {
                state: {
                  prefetchedMember: memberInfo,
                  detailKeywords: [
                    memberInfo.loginId,
                    memberInfo.studentNumber,
                    memberInfo.userName,
                  ],
                },
              });
            }}
          >
            유저 상세 페이지로 이동
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
