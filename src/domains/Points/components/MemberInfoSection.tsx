import { Input, Label } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

interface MemberInfoSectionProps {
  searchedMember: MemberInfo;
}

export function MemberInfoSection({ searchedMember }: MemberInfoSectionProps) {
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
      <h3 className='text-lg font-bold'>회원 정보 상세</h3>
      <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4 pb-5'>
        {MEMBER_INFO.map(({ label, id, value }) => (
          <div className='flex flex-col gap-1' key={id}>
            <Label htmlFor={id} required>
              {label}
            </Label>
            <Input
              type='text'
              id={id}
              value={value ?? ''}
              readOnly
              className='cursor-not-allowed bg-gray-100'
              placeholder='회원을 검색해 주세요.'
            />
          </div>
        ))}
      </div>
    </article>
  );
}
