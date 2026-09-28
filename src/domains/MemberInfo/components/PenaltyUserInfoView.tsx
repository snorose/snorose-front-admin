import { useId } from 'react';

import { Copy } from 'lucide-react';

import { Input, InputGroup, Label } from '@/shared/components/ui';
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

  const handleCopy = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <article>
      <div className='grid grid-cols-2 gap-x-5 gap-y-1 rounded-md border p-4 pb-5'>
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
              <div key={key} className='flex gap-4'>
                <Label
                  htmlFor={`${inputId}-${key}`}
                  className='text-foreground w-32'
                >
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
            <div key={key} className='flex gap-4'>
              <Label
                htmlFor={`${inputId}-${key}`}
                className='text-foreground w-32'
              >
                {label}
              </Label>

              {isCopy ? (
                <InputGroup
                  className={`w-60 ${!rawValue ? 'bg-muted text-muted-foreground' : ''}`}
                >
                  <InputGroup.Input
                    id={`${inputId}-${key}`}
                    readOnly
                    value={displayValue}
                    placeholder='회원을 검색해 주세요.'
                  />
                  <InputGroup.Addon align='inline-end'>
                    <InputGroup.Button
                      size='icon-xs'
                      onClick={() => handleCopy(String(displayValue))}
                      disabled={!displayValue}
                      aria-label={`${label} 복사`}
                    >
                      <Copy aria-hidden='true' />
                    </InputGroup.Button>
                  </InputGroup.Addon>
                </InputGroup>
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
