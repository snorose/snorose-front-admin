import { Bell, BookOpen, ShieldAlert, UserRoundX } from 'lucide-react';

import { Button, Tooltip } from '@/shared/components/ui';

const PLACEHOLDER_ACTIONS = [
  { label: '포인트 지급', icon: BookOpen },
  { label: '제재 부여', icon: ShieldAlert },
  { label: '회원 탈퇴', icon: UserRoundX },
  { label: '알림 전송', icon: Bell },
];

export default function MemberDirectoryActionBar() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <div className='flex flex-wrap items-center gap-2'>
        {PLACEHOLDER_ACTIONS.map((action) => (
          <Tooltip key={action.label}>
            <Tooltip.Trigger asChild>
              <span
                role='group'
                tabIndex={0}
                aria-label={`${action.label} 기능 준비 중`}
                className='focus-visible:ring-ring/50 inline-flex cursor-help rounded-md outline-none focus-visible:ring-[3px]'
              >
                <Button type='button' variant='outline' disabled>
                  <action.icon aria-hidden='true' className='h-4 w-4' />
                  {action.label}
                </Button>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content side='top' sideOffset={4}>
              준비 중인 기능입니다.
            </Tooltip.Content>
          </Tooltip>
        ))}
      </div>
    </Tooltip.Provider>
  );
}
