import { useId } from 'react';

import { CopyableValue } from '@/shared/components';
import { Input, Label } from '@/shared/components/ui';
import type { PenaltyUserInfo } from '@/shared/types';

import { PENALTY_USER_INFO } from '@/domains/MemberInfo/constants/memberInfo';
import { getActivePenaltyLabel } from '@/domains/MemberInfo/utils/memberDirectory';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';

export default function PenaltyUserInfo({
  member,
}: {
  member: PenaltyUserInfo | null;
}) {
  const inputId = useId();
  const COPY_KEYS: (keyof PenaltyUserInfo)[] = ['studentNumber', 'loginId'];

  const DATE_FIELDS: (keyof PenaltyUserInfo)[] = [
    'blacklistStartDate',
    'blacklistEndDate',
  ];

  return (
    <article>
      {!member && (
        <p className='text-muted-foreground mb-2 text-sm'>
          회원을 검색해 주세요.
        </p>
      )}
      <div className='grid grid-cols-1 gap-x-5 gap-y-1 rounded-lg border p-4 pb-5 xl:grid-cols-2'>
        {PENALTY_USER_INFO.map(({ label, key }) => {
          const rawValue = member?.[key];

          const displayValue: string | number =
            key === 'userRoleId'
              ? convertUserRoleIdToEnum(rawValue as number)
              : key === 'isBlacklist'
                ? member
                  ? getActivePenaltyLabel(member)
                  : '정상'
                : typeof rawValue === 'boolean'
                  ? String(rawValue)
                  : (rawValue ?? '');

          const isCopy = COPY_KEYS.includes(key);

          // 날짜 처리
          if (DATE_FIELDS.includes(key)) {
            const dateValue = rawValue ? String(rawValue).substring(0, 10) : '';

            return (
              <div key={key} className='flex min-w-0 items-center gap-4'>
                <Label htmlFor={`${inputId}-${key}`} className='w-32 shrink-0'>
                  {label}
                </Label>

                <Input
                  id={`${inputId}-${key}`}
                  readOnly
                  value={dateValue}
                  placeholder='회원을 검색해 주세요.'
                  className={`w-60 overflow-x-scroll ${!rawValue ? 'bg-muted text-muted-foreground' : ''}`}
                />
              </div>
            );
          }

          return (
            <div key={key} className='flex min-w-0 items-center gap-4'>
              <Label htmlFor={`${inputId}-${key}`} className='w-32 shrink-0'>
                {label}
              </Label>

              {isCopy ? (
                <CopyableValue
                  id={`${inputId}-${key}`}
                  variant='input'
                  className='w-60'
                  value={rawValue == null ? undefined : String(rawValue)}
                  label={label}
                />
              ) : (
                <Input
                  id={`${inputId}-${key}`}
                  readOnly
                  value={displayValue}
                  placeholder='회원을 검색해 주세요.'
                  className={`w-60 overflow-x-scroll ${!rawValue ? 'bg-muted text-muted-foreground' : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
