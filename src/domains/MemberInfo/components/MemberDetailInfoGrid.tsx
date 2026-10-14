import { Coins, History } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button, Field } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';
import { formatDateOnly, formatDateTimeToMinutes } from '@/shared/utils';

import { ReadonlyField } from '@/domains/MemberInfo/components/MemberInfoEditFormFields';
import {
  formatDisplayValue,
  formatPoint,
  getRoleBadgeMeta,
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
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <ReadonlyField label='이름' value={formatDisplayValue(member.userName)} />
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
      <ReadonlyField label='생년월일' value={formatDateOnly(member.birthday)} />
      <ReadonlyField label='전공' value={formatDisplayValue(member.major)} />
      <ReadonlyField label='가입일' value={formatDateOnly(member.createdAt)} />
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
      <Field className='gap-0'>
        <Field.Label>회원 등급</Field.Label>
        <Field.Content>
          <div className='border-input bg-muted flex min-h-9 items-center rounded-md border px-3 py-1'>
            <StatusBadge tone={getRoleBadgeMeta(member.userRoleId).tone}>
              {roleLabel}
            </StatusBadge>
          </div>
        </Field.Content>
      </Field>
      <ReadonlyField label='이메일' value={formatDisplayValue(member.email)} />
    </div>
  );
}
