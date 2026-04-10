import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Copy,
  GraduationCap,
  IdCard,
  type LucideIcon,
  Mail,
  ShieldAlert,
  UserRound,
} from 'lucide-react';

import type { MemberInfo } from '@/shared/types';

import {
  EMPTY_TEXT,
  formatDate,
  formatDisplayValue,
  formatPoint,
} from '@/domains/MemberInfo/utils/memberDirectory';

type MemberDetailInfoGridProps = {
  member: MemberInfo;
  onCopy: (value: string) => void | Promise<void>;
  roleLabel: string;
};

export default function MemberDetailInfoGrid({
  member,
  onCopy,
  roleLabel,
}: MemberDetailInfoGridProps) {
  return (
    <div className='space-y-8'>
      <div className='flex flex-col items-center gap-4 border-b border-slate-100 pb-8'>
        <div className='flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400'>
          <UserRound className='h-12 w-12' />
        </div>
        <div className='text-center'>
          <p className='text-2xl font-semibold text-slate-950'>
            {member.userName}
          </p>
          <p className='text-sm text-slate-500'>
            {formatDisplayValue(member.nickname)}
          </p>
        </div>
      </div>

      <div className='grid gap-x-10 gap-y-6 md:grid-cols-2'>
        <DetailField
          icon={UserRound}
          label='이름'
          value={formatDisplayValue(member.userName)}
        />
        <DetailField
          icon={IdCard}
          label='아이디'
          value={formatDisplayValue(member.loginId)}
          copyValue={member.loginId}
          onCopy={onCopy}
        />
        <DetailField
          icon={UserRound}
          label='닉네임'
          value={formatDisplayValue(member.nickname)}
        />
        <DetailField
          icon={GraduationCap}
          label='학번'
          value={formatDisplayValue(member.studentNumber)}
          copyValue={member.studentNumber}
          onCopy={onCopy}
        />
        <DetailField
          icon={CalendarDays}
          label='생년월일'
          value={formatDate(member.birthday)}
        />
        <DetailField
          icon={GraduationCap}
          label='전공'
          value={formatDisplayValue(member.major)}
        />
        <DetailField
          icon={CalendarDays}
          label='가입일'
          value={formatDate(member.createdAt)}
        />
        <DetailField
          icon={CalendarDays}
          label='등업일'
          value={formatDate(member.authenticatedAt)}
        />
        <DetailField icon={BadgeCheck} label='회원 등급' value={roleLabel} />
        <DetailField
          icon={Mail}
          label='이메일'
          value={formatDisplayValue(member.email)}
        />
        <DetailField
          icon={ShieldAlert}
          label='누적 경고 수'
          value={`${member.totalWarningCount}회`}
        />
        <DetailField
          icon={IdCard}
          label='회원 ID (암호화)'
          value={formatDisplayValue(member.encryptedUserId)}
          copyValue={member.encryptedUserId}
          onCopy={onCopy}
        />
        <DetailField
          icon={BookOpen}
          label='보유 포인트'
          value={formatPoint(member.pointBalance)}
        />
      </div>
    </div>
  );
}

function DetailField({
  copyValue,
  icon: Icon,
  label,
  onCopy,
  value,
}: {
  copyValue?: string;
  icon: LucideIcon;
  label: string;
  onCopy?: (value: string) => void | Promise<void>;
  value: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
        <Icon className='h-4 w-4' />
        {label}
      </div>

      <div className='flex items-start gap-2'>
        <p className='text-lg font-semibold break-all text-slate-950'>
          {value}
        </p>
        {copyValue && onCopy && value !== EMPTY_TEXT && (
          <button
            type='button'
            onClick={() => void onCopy(copyValue)}
            className='rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
            aria-label={`${label} 복사`}
          >
            <Copy className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
}
