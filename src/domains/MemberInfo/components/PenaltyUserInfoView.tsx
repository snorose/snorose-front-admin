import { Label, Input } from '@/components/ui';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';
import { PENALTY_USER_INFO } from '@/domains/MemberInfo/constants/memberInfo';

import type { PenaltyUserInfo } from '@/shared/types';

export default function PenaltyUserInfo({
  member,
}: {
  member: PenaltyUserInfo;
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
          const rawValue = member[key];

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
                  className={`w-60 overflow-x-scroll ${!rawValue ? 'bg-gray-100 text-gray-500' : ''}`}
                />
              </div>
            );
          }

          return (
            <div key={key} className='flex gap-4'>
              <Label className='w-32 text-gray-700'>{label}</Label>

              <Input
                readOnly
                value={displayValue}
                onClick={() => isCopy && handleCopy(String(displayValue))}
                className={`w-60 overflow-x-scroll ${!rawValue ? 'bg-gray-100 text-gray-500' : ''} ${isCopy ? 'cursor-pointer text-gray-600 underline hover:text-blue-800' : ''}`}
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}
