import { Coins, History, UserRound } from 'lucide-react';

import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';
import { formatDateOnly, formatDateTimeToMinutes } from '@/shared/utils';

import { ReadonlyField } from '@/domains/MemberInfo/components/MemberInfoEditFormFields';
import {
  formatDisplayValue,
  formatPoint,
} from '@/domains/MemberInfo/utils/memberDirectory';

type MemberDetailInfoGridProps = {
  member: MemberInfo;
  onCopy: (value: string) => void | Promise<void>;
  onPointAdjustmentOpen: () => void;
  onPointHistoryOpen: () => void;
  roleLabel: string;
};

export default function MemberDetailInfoGrid({
  member,
  onCopy,
  onPointAdjustmentOpen,
  onPointHistoryOpen,
  roleLabel,
}: MemberDetailInfoGridProps) {
  return (
    <div className='space-y-8'>
      <div className='flex flex-col items-center gap-4 border-b border-slate-100 pb-8'>
        <div className='flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400'>
          {member.profileImageUrl ? (
            <img
              src={member.profileImageUrl}
              alt={`${member.userName} 프로필`}
              className='h-full w-full object-cover'
            />
          ) : (
            <UserRound className='h-12 w-12' />
          )}
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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <ReadonlyField
          label='이름'
          value={formatDisplayValue(member.userName)}
        />
        <ReadonlyField
          label='아이디'
          value={formatDisplayValue(member.loginId)}
          copyValue={member.loginId}
          onCopy={onCopy}
        />
        <ReadonlyField
          label='닉네임'
          value={formatDisplayValue(member.nickname)}
        />
        <ReadonlyField
          label='학번'
          value={formatDisplayValue(member.studentNumber)}
          copyValue={member.studentNumber}
          onCopy={onCopy}
        />
        <ReadonlyField
          label='생년월일'
          value={formatDateOnly(member.birthday)}
        />
        <ReadonlyField label='전공' value={formatDisplayValue(member.major)} />
        <ReadonlyField
          label='가입일'
          value={formatDateOnly(member.createdAt)}
        />
        <ReadonlyField
          label='등업일'
          value={formatDateOnly(member.authenticatedAt)}
        />
        <ReadonlyField
          label='최근 로그인 날짜'
          value={formatDateOnly(member.lastLoginAt)}
        />
        <ReadonlyField
          label='정보 수정일'
          value={formatDateTimeToMinutes(member.updatedAt)}
        />
        <ReadonlyField
          label='보유 포인트'
          value={formatPoint(member.pointBalance)}
          action={
            <div className='flex shrink-0 items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onPointHistoryOpen}
                aria-label='포인트 증감 히스토리 열기'
                title='포인트 증감 히스토리'
              >
                <History aria-hidden='true' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onPointAdjustmentOpen}
                aria-label='포인트 지급/차감'
                title='포인트 지급/차감'
              >
                <Coins aria-hidden='true' />
              </Button>
            </div>
          }
        />
        <ReadonlyField
          label='회원 ID (암호화)'
          value={formatDisplayValue(member.encryptedUserId)}
          copyValue={member.encryptedUserId}
          onCopy={onCopy}
        />
        <ReadonlyField label='회원 등급' value={roleLabel} />
        <ReadonlyField
          label='이메일'
          value={formatDisplayValue(member.email)}
        />
      </div>
    </div>
  );
}
