import { Copy } from 'lucide-react';

import { Input, Label } from '@/shared/components/ui';
import type { PenaltyUserInfo } from '@/shared/types';

import { PENALTY_USER_INFO } from '@/domains/MemberInfo/constants/memberInfo';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';

export default function PenaltyUserInfo({
  member,
}: {
  member: PenaltyUserInfo | null;
}) {
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

          const displayValue =
            key === 'userRoleId'
              ? convertUserRoleIdToEnum(rawValue as number)
              : (rawValue ?? '');

          const isCopy = COPY_KEYS.includes(key);

          // 날짜 처리
          if (DATE_FIELDS.includes(key)) {
            const dateValue = rawValue ? String(rawValue).substring(0, 10) : '';

            return (
              <div key={key} className='flex gap-4'>
                <Label className='w-32 text-gray-700'>{label}</Label>

                <Input
                  readOnly
                  value={dateValue}
                  placeholder='회원을 검색해 주세요.'
                  className={`w-60 overflow-x-scroll ${!rawValue ? 'bg-gray-100 text-gray-500' : ''}`}
                />
              </div>
            );
          }

          return (
            <div key={key} className='flex gap-4'>
              <Label className='w-32 text-gray-700'>{label}</Label>

              <div className='relative w-60'>
                <Input
                  readOnly
                  value={displayValue}
                  placeholder='회원을 검색해 주세요.'
                  className={`w-full overflow-x-scroll ${isCopy ? 'pr-10' : ''} ${!rawValue ? 'bg-gray-100 text-gray-500' : ''}`}
                />
                {isCopy && (
                  <button
                    type='button'
                    onClick={() => handleCopy(String(displayValue))}
                    disabled={!displayValue}
                    aria-label='복사'
                    className='absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    <Copy className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
