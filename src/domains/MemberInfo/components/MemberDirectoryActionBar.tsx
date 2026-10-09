import { Bell, BookOpen, ShieldAlert, UserRoundX } from 'lucide-react';

import { Button } from '@/shared/components/ui';

const PLACEHOLDER_ACTIONS = [
  { label: '포인트 지급', icon: BookOpen },
  { label: '제재 부여', icon: ShieldAlert },
  { label: '회원 탈퇴', icon: UserRoundX },
  { label: '알림 전송', icon: Bell },
];

export default function MemberDirectoryActionBar() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {PLACEHOLDER_ACTIONS.map((action) => (
        <Button key={action.label} type='button' variant='outline' disabled>
          <action.icon className='h-4 w-4' />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
