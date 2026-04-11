import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Input, Label } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import { MEMBER_INFO } from '@/domains/MemberInfo/constants/memberInfo';
import {
  convertBlacklistTypeToLabel,
  convertUserRoleIdToEnum,
} from '@/domains/MemberInfo/utils/memberInfoFormatters';

export default function MemberInfoView({
  member,
  showSearchPlaceholder = true,
}: {
  member: MemberInfo | null;
  showSearchPlaceholder?: boolean;
}) {
  const COPY_KEYS: (keyof MemberInfo)[] = [
    'encryptedUserId',
    'studentNumber',
    'loginId',
  ];

  const DATE_FIELDS: (keyof MemberInfo)[] = [
    'createdAt',
    'authenticatedAt',
    'blacklistStartDate',
    'blacklistEndDate',
  ];

  const handleCopy = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success('복사되었습니다.');
  };

  return (
    <article>
      <div className='grid grid-cols-2 gap-x-5 gap-y-1'>
        {MEMBER_INFO.map(({ label, key }) => {
          const rawValue = member?.[key];

          const displayValue: string | number =
            key === 'userRoleId'
              ? convertUserRoleIdToEnum(rawValue as number)
              : key === 'isBlacklist'
                ? member?.isBlacklist
                  ? convertBlacklistTypeToLabel(member.blacklistType)
                  : '정상'
                : typeof rawValue === 'boolean'
                  ? String(rawValue)
                  : (rawValue ?? '');

          const isCopy = COPY_KEYS.includes(key);

          // 날짜 처리
          const placeholder = showSearchPlaceholder
            ? '회원을 검색해 주세요.'
            : '';

          if (DATE_FIELDS.includes(key)) {
            const dateValue = rawValue ? String(rawValue).substring(0, 10) : '';

            return (
              <div key={key} className='flex gap-4'>
                <Label className='w-32 text-gray-700'>{label}</Label>

                <Input
                  readOnly
                  value={dateValue}
                  placeholder={placeholder}
                  className={`w-60 ${!rawValue ? 'bg-gray-100 text-gray-500' : ''}`}
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
                  placeholder={placeholder}
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
