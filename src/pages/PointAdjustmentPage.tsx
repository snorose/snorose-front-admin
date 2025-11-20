import { Button, Input } from '@/components/ui';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import type { MemberInfo } from '@/types';
import { useState } from 'react';
import { cn } from '@/utils';

const MEMBER_INFO: { label: string; key: keyof MemberInfo }[] = [
  { label: '사용자 ID', key: 'userId' },
  { label: '이름', key: 'userName' },
  { label: '아이디', key: 'loginId' },
  { label: '학번', key: 'studentNumber' },
  { label: '전공', key: 'major' },
];

const ACTION_COLUMN_LABEL = '선택/해제';

export default function PointAdjustmentPage() {
  const [selectedMembers, setSelectedMembers] = useState<MemberInfo[]>([]);

  const handleSelectMember = (member: MemberInfo) => {
    setSelectedMembers((prev) => {
      const alreadySelected = prev.some(
        (selectedMember) => selectedMember.userId === member.userId
      );

      if (alreadySelected) {
        return prev.filter(
          (selectedMember) => selectedMember.userId !== member.userId
        );
      }

      return [...prev, member];
    });
  };

  return (
    <div className='flex w-full flex-col gap-4'>
      <h1 className='text-2xl font-bold'>포인트 증감(지급/차감)</h1>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>회원 조회</h3>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='이름, 아이디, 학번 중 하나를 입력해주세요'
            className='w-96'
          />
          <Button type='submit' className='h-10 w-20 text-black'>
            <span>검색</span>
          </Button>
        </div>
        <div className='w-full rounded-md border p-2'>
          <table className='w-full'>
            <thead>
              <tr>
                {MEMBER_INFO.map((info) => (
                  <th
                    key={`header-${info.key}`}
                    className='w-1/6 p-2 text-left font-semibold'
                  >
                    {info.label}
                  </th>
                ))}
                <th className='p-2 text-left font-semibold'>
                  {ACTION_COLUMN_LABEL}
                </th>
              </tr>
            </thead>
            <tbody>
              {MEMBER_SAMPLE_DATA.map((member) => {
                const isSelected = selectedMembers.some(
                  (selectedMember) => selectedMember.userId === member.userId
                );

                return (
                  <tr
                    key={`${member.userId}`}
                    className={cn(
                      'cursor-pointer hover:bg-gray-100',
                      isSelected && 'text-blue-600'
                    )}
                  >
                    {MEMBER_INFO.map((info) => (
                      <td key={`${member.userId}-${info.key}`} className='p-2'>
                        {member[info.key]}
                      </td>
                    ))}
                    <td className='p-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='cursor-pointer'
                        onClick={() => handleSelectMember(member)}
                      >
                        {isSelected ? (
                          <span className='text-red-500 hover:text-red-700'>
                            해제
                          </span>
                        ) : (
                          <span>선택</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>
          선택된 회원 (총 {selectedMembers.length}명)
        </h3>
        <div className='w-full rounded-md border p-2'>
          <table className='w-full'>
            <thead>
              <tr>
                {MEMBER_INFO.map((info) => (
                  <th
                    key={`header-${info.key}`}
                    className='w-1/6 p-2 text-left font-semibold'
                  >
                    {info.label}
                  </th>
                ))}
                <th className='p-2 text-left font-semibold'>
                  {ACTION_COLUMN_LABEL}
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedMembers.length > 0 ? (
                selectedMembers.map((member) => (
                  <tr key={`${member.userId}`}>
                    {MEMBER_INFO.map((info) => (
                      <td key={`${member.userId}-${info.key}`} className='p-2'>
                        {member[info.key]}
                      </td>
                    ))}
                    <td className='p-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='cursor-pointer text-red-500 hover:text-red-700'
                        onClick={() =>
                          setSelectedMembers((prev) =>
                            prev.filter(
                              (selectedMember) =>
                                selectedMember.userId !== member.userId
                            )
                          )
                        }
                      >
                        해제
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={MEMBER_INFO.length + 1}
                    className='p-2 text-center text-sm text-gray-500'
                  >
                    선택된 회원이 없어요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트</h3>
        <div className='flex w-full gap-2 rounded-md border p-2'>hi</div>
      </article>
    </div>
  );
}
