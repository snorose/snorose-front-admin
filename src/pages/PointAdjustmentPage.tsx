import { Button, Input } from '@/components/ui';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__/members';
import type { MemberInfo } from '@/types';

const MEMBER_INFO: { label: string; key: keyof MemberInfo }[] = [
  { label: '이름', key: 'name' },
  { label: '아이디', key: 'id' },
  { label: '학번', key: 'studentId' },
  { label: '사용자 ID', key: 'userId' },
  { label: '전공', key: 'major' },
  { label: '보유 포인트', key: 'ownedPoint' },
  { label: '회원등급', key: 'memberGrade' },
  { label: '생년월일', key: 'birthDate' },
];

export default function PointAdjustmentPage() {
  return (
    <div className='flex flex-col gap-4 w-full'>
      <h1 className='text-2xl font-bold'>포인트 증감(지급/차감)</h1>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>회원 조회</h3>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='이름, 아이디, 학번 중 하나를 입력해주세요'
            className='w-96'
          />
          <Button type='submit' className='text-black h-10 w-20'>
            <span>검색</span>
          </Button>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>선택된 회원 (총 2명)</h3>
        <div className='flex gap-2 border rounded-md p-2 w-full'>
          <div
            className='grid gap-2'
            style={{
              gridTemplateColumns: `repeat(${MEMBER_INFO.length}, minmax(0, 1fr))`,
            }}
          >
            {MEMBER_INFO.map((info) => (
              <span key={`header-${info.key}`} className='font-semibold'>
                {info.label}
              </span>
            ))}
            {MEMBER_SAMPLE_DATA.map((member) =>
              MEMBER_INFO.map((info) => (
                <span key={`${member.id}-${info.key}`}>
                  {member[info.key as keyof typeof member] ?? '-'}
                </span>
              ))
            )}
          </div>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트</h3>
        <div className='flex gap-2 border rounded-md p-2 w-full'>hi</div>
      </article>
    </div>
  );
}
