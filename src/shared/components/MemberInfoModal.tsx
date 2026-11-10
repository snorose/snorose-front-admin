import { useNavigate } from 'react-router-dom';

import type { MemberInfo } from '@/shared/types';

import { DescriptionListModal } from './DescriptionListModal';

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
    <DescriptionListModal
      open={isOpen}
      onClose={onClose}
      title='회원 정보'
      className='sm:max-w-md'
      items={[
        { label: '이름', value: memberInfo.userName },
        { label: '아이디', value: memberInfo.loginId },
        { label: '학번', value: memberInfo.studentNumber },
        { label: '닉네임', value: memberInfo.nickname },
        {
          label: '포인트',
          value: `${memberInfo.pointBalance.toLocaleString()}P`,
        },
        { label: '경고 이력', value: `${memberInfo.totalWarningCount}회` },
        {
          label: '강등 이력',
          value: memberInfo.isBlacklist
            ? (memberInfo.blacklistType ?? '강등 중')
            : '없음',
        },
      ]}
      cancelLabel='닫기'
      action={{
        label: '유저 상세 페이지로 이동',
        onClick: () => {
          onClose();
          navigate(`/member/info/${encryptedUserId}`);
        },
      }}
    />
  );
}
