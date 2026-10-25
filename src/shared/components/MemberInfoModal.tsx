import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import { Modal } from './Modal';

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
    <Modal
      title='회원 정보'
      className='sm:max-w-md'
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Body>
        {memberInfo && (
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
        )}
      </Modal.Body>
      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  );
}
