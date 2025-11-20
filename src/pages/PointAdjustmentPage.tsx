import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import type { MemberInfo } from '@/types';
import { useState } from 'react';
import { cn } from '@/utils';
import { POINT_CATEGORY } from '@/constants';

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
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof POINT_CATEGORY | ''
  >('');

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
        <div className='flex w-full flex-col gap-2 rounded-md border p-2'>
          <>
            <label htmlFor='userId' className='font-bold'>
              회원 userId *
            </label>
            <Input
              type='number'
              id='userId'
              placeholder='회원 userId를 입력해주세요'
            />
          </>
          <>
            <label htmlFor='difference' className='font-bold'>
              증감 포인트 *
            </label>
            <Input
              type='number'
              id='difference'
              placeholder='증감할 포인트를 입력해주세요 (예: 20, -50)'
            />
          </>
          <>
            <label htmlFor='category' className='font-bold'>
              포인트 유형 *
            </label>
            <div className='w-100'>
              <Select
                onValueChange={(
                  selectedKey: keyof typeof POINT_CATEGORY | ''
                ) => setSelectedCategory(selectedKey)}
                value={selectedCategory || undefined}
              >
                <SelectTrigger className='w-100'>
                  <SelectValue placeholder='포인트 유형을 선택해주세요' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POINT_CATEGORY).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
          <>
            <label htmlFor='sourceId' className='font-bold'>
              관리자 userId *
            </label>
            <Input
              type='number'
              id='sourceId'
              placeholder='@TODO 관리자 userId 자동 입력'
              disabled
            />
          </>
          <>
            <label htmlFor='sourceType' className='font-bold'>
              포인트 출처 유형 *
            </label>
            <Input type='text' id='sourceType' value='ADMIN' disabled />
          </>
          <>
            <label htmlFor='memo' className='font-bold'>
              메모
            </label>
            <Input
              type='text'
              id='memo'
              placeholder='이벤트 당첨 포인트 지급, 시험 후기 오류 제보 등'
            />
          </>
        </div>
      </article>
    </div>
  );
}
