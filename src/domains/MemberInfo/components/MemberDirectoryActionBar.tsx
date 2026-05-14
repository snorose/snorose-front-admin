import { Bell, BookOpen, ShieldAlert, UserRoundX } from 'lucide-react';

import { Button } from '@/shared/components/ui';

type MemberDirectoryActionBarProps = {
  hasSelection: boolean;
  onOpenPenaltyModal: () => void;
};

const SECONDARY_ACTIONS = [
  { label: '회원 탈퇴', icon: UserRoundX, accent: true },
  { label: '알림 전송', icon: Bell },
];

export default function MemberDirectoryActionBar({
  hasSelection,
  onOpenPenaltyModal,
}: MemberDirectoryActionBarProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button
        type='button'
        variant='outline'
        disabled={!hasSelection}
        className={`h-9 rounded-full px-4 ${
          hasSelection
            ? 'border-slate-200 text-slate-700'
            : 'border-slate-200 text-slate-400'
        }`}
      >
        <BookOpen className='h-4 w-4' />
        포인트 지급
      </Button>

      <Button
        type='button'
        variant='outline'
        disabled={!hasSelection}
        onClick={onOpenPenaltyModal}
        className={`h-9 rounded-full px-4 ${
          hasSelection
            ? 'border-slate-200 text-slate-700'
            : 'border-slate-200 text-slate-400'
        }`}
      >
        <ShieldAlert className='h-4 w-4' />
        제재 부여
      </Button>

      {SECONDARY_ACTIONS.map((action) => (
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
