import { Coins, History } from 'lucide-react';

import { StatusBadge } from '@/shared/components';
import { Button, Field } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';
import { formatDateOnly, formatDateTimeToMinutes } from '@/shared/utils';

import { MemberEmailInfoTooltip } from '@/domains/MemberInfo/components/MemberEmailInfoTooltip';
import { ReadonlyField } from '@/domains/MemberInfo/components/MemberInfoEditFormFields';
import {
  formatDisplayValue,
  formatPoint,
  getRoleBadgeMeta,
} from '@/domains/MemberInfo/utils/memberDirectory';

type MemberDetailInfoGridProps = {
  member: MemberInfo;
  onPointAdjustmentOpen: () => void;
  onPointHistoryOpen: () => void;
  roleLabel: string;
};

export default function MemberDetailInfoGrid({
  member,
  onPointAdjustmentOpen,
  onPointHistoryOpen,
  roleLabel,
}: MemberDetailInfoGridProps) {
  return (
    <div className='@container grid grid-cols-1 gap-4 md:grid-cols-2'>
      <ReadonlyField label='이름' value={formatDisplayValue(member.userName)} />
      <ReadonlyField
        label='아이디'
        value={formatDisplayValue(member.loginId)}
        copyValue={member.loginId ?? ''}
      />
      <ReadonlyField
        label='닉네임'
        value={formatDisplayValue(member.nickname)}
      />
      <ReadonlyField
        label='학번'
        value={formatDisplayValue(member.studentNumber)}
        copyValue={member.studentNumber ?? ''}
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
        className='md:col-span-2 @3xl:col-span-1'
        value={formatPoint(member.pointBalance)}
        action={
          <div className='flex shrink-0 items-center gap-1.5'>
            <Button
              type='button'
              variant='outline'
              onClick={onPointHistoryOpen}
              aria-label='포인트 이력 열기'
            >
              <History aria-hidden='true' />
              포인트 이력
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onPointAdjustmentOpen}
              aria-label='포인트 지급·차감'
            >
              <Coins aria-hidden='true' />
              지급·차감
            </Button>
          </div>
        }
      />
      <ReadonlyField
        label='회원 ID (암호화)'
        value={formatDisplayValue(member.encryptedUserId)}
        copyValue={member.encryptedUserId ?? ''}
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
      <ReadonlyField
        label='이메일'
        labelAction={<MemberEmailInfoTooltip />}
        value={formatDisplayValue(member.email)}
      />
    </div>
  );
}
