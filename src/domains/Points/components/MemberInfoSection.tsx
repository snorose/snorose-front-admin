import { useId } from 'react';

import { SectionTitle } from '@/shared/components';
import { Input, Label } from '@/shared/components/ui';
import type { AdminUserListItem } from '@/shared/types';

interface MemberInfoSectionProps {
  searchedMember: AdminUserListItem | null;
}

export function MemberInfoSection({ searchedMember }: MemberInfoSectionProps) {
  const inputId = useId();
  const MEMBER_INFO = [
    {
      label: '이름',
      id: 'userName',
      value: searchedMember?.userName,
    },
    {
      label: '전공',
      id: 'major',
      value: searchedMember?.major,
    },
    {
      label: '아이디',
      id: 'loginId',
      value: searchedMember?.loginId,
    },
    {
      label: '학번',
      id: 'studentNumber',
      value: searchedMember?.studentNumber,
    },
    {
      label: '회원 ID',
      id: 'encryptedUserId',
      value: searchedMember?.encryptedUserId,
    },
  ] as const;

  return (
    <article className='flex flex-col gap-1'>
      <SectionTitle>회원 정보 상세</SectionTitle>
      <div className='grid w-full grid-cols-2 gap-4 rounded-lg border p-4 pb-5'>
        {MEMBER_INFO.map(({ label, id, value }) => (
          <div className='flex flex-col gap-1' key={id}>
            <Label htmlFor={`${inputId}-${id}`} required>
              {label}
            </Label>
            <Input
              type='text'
              id={`${inputId}-${id}`}
              value={value ?? ''}
              readOnly
              className='bg-muted cursor-not-allowed'
              placeholder='회원을 검색해 주세요.'
            />
          </div>
        ))}
      </div>
    </article>
  );
}
