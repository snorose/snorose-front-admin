import { Label, Input } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

interface MemberInfoSectionProps {
  searchedMember: MemberInfo;
  userId: number | null;
  onUserIdChange: (value: number) => void;
}

export default function MemberInfoSection({
  searchedMember,
  userId,
  onUserIdChange,
}: MemberInfoSectionProps) {
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

        <div className='flex flex-col gap-1'>
          <Label htmlFor='userId' required>
            userId
          </Label>
          <Input
            type='text'
            id='userId'
            placeholder='직접 입력해 주세요.'
            value={userId ?? ''}
            onChange={(e) => onUserIdChange(Number(e.target.value))}
          />
        </div>
      </div>
    </article>
  );
}
