import { Bell, BookOpen, ShieldAlert, UserRoundX } from 'lucide-react';

import { Button } from '@/shared/components/ui';

type MemberDirectoryActionBarProps = {
  hasSelection: boolean;
};

const PLACEHOLDER_ACTIONS = [
  { label: '포인트 지급', icon: BookOpen },
  { label: '제재 부여', icon: ShieldAlert },
  { label: '회원 탈퇴', icon: UserRoundX, accent: true },
  { label: '알림 전송', icon: Bell },
];

export default function MemberDirectoryActionBar({
  hasSelection,
}: MemberDirectoryActionBarProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {PLACEHOLDER_ACTIONS.map((action) => (
        <Button
          key={action.label}
          type='button'
          variant='outline'
          disabled={!hasSelection}
          className={`h-9 rounded-full px-4 ${
            hasSelection
              ? action.accent
                ? 'border-rose-200 bg-rose-50 text-rose-500'
                : 'border-slate-200 text-slate-700'
              : action.accent
                ? 'border-rose-200 bg-rose-50 text-rose-300'
                : 'border-slate-200 text-slate-400'
          }`}
        >
          <action.icon className='h-4 w-4' />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
