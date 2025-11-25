import { useState } from 'react';
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from '@/components/ui';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import type { MemberInfo } from '@/types';
import { cn } from '@/utils';
import { POINT_CATEGORY } from '@/constants';

const MEMBER_INFO: { label: string; key: keyof MemberInfo }[] = [
  { label: '회원 ID', key: 'userId' },
  { label: '이름', key: 'userName' },
  { label: '아이디', key: 'loginId' },
  { label: '학번', key: 'studentNumber' },
  { label: '전공', key: 'major' },
];
const ACTION_COLUMN_LABEL = '선택/해제';

export default function PointAdjustmentPage() {
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [userId, setUserId] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof POINT_CATEGORY | ''
  >('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MemberInfo[]>([]);
  const [difference, setDifference] = useState<number | ''>(0);
  const [memo, setMemo] = useState<string>('');

  const handleSelectMember = (member: MemberInfo) => {
    setSelectedMember((prev) =>
      prev?.userId === member.userId ? null : member
    );
    // 회원 선택 시 userId 입력란에 자동으로 채우기
    if (selectedMember?.userId === member.userId) {
      setUserId('');
    } else {
      setUserId(member.userId);
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? '' : Number(value);
    setUserId(numValue);

    if (selectedMember && selectedMember.userId !== numValue) {
      setSelectedMember(null);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    const results = MEMBER_SAMPLE_DATA.filter(
      (member) =>
        member.userName.toLowerCase().includes(query) ||
        member.loginId.toLowerCase().includes(query) ||
        member.studentNumber.toLowerCase().includes(query)
    );
    setSearchResults(results);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResetButtonClick = () => {
    setUserId('');
    setSelectedMember(null);
    setSelectedCategory('');
    setSearchQuery('');
    setSearchResults([]);
    setDifference('');
    setMemo('');
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <h1 className='text-2xl font-bold'>단일건 포인트 지급/차감</h1>
      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>회원 조회</h3>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='이름, 아이디, 학번 중 하나를 입력해주세요'
            className='w-96'
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='h-auto w-20 cursor-pointer text-black'
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
        <div className='w-full rounded-md border p-2'>
          <table className='w-full'>
            <thead>
              <tr>
                {MEMBER_INFO.map((info) => (
                  <th
                    key={`header-${info.key}`}
                    className='w-1/6 p-2 text-left text-sm font-semibold'
                  >
                    {info.label}
                  </th>
                ))}
                <th className='p-2 text-left text-sm font-semibold'>
                  {ACTION_COLUMN_LABEL}
                </th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={MEMBER_INFO.length + 1}
                    className='p-5 text-center text-sm text-gray-500'
                  >
                    조회된 회원이 없어요.
                  </td>
                </tr>
              ) : (
                searchResults.map((member) => {
                  const isSelected = selectedMember?.userId === member.userId;

                  return (
                    <tr
                      key={`${member.userId}`}
                      className={cn(
                        'cursor-pointer hover:bg-gray-100',
                        isSelected && 'bg-blue-100 text-blue-600'
                      )}
                    >
                      {MEMBER_INFO.map((info) => (
                        <td
                          key={`${member.userId}-${info.key}`}
                          className='p-2 text-sm'
                        >
                          {member[info.key]}
                        </td>
                      ))}
                      <td className='p-2 text-sm'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='cursor-pointer'
                          onClick={() => handleSelectMember(member)}
                        >
                          {isSelected ? (
                            <span className='text-red-500 active:text-red-700'>
                              해제
                            </span>
                          ) : (
                            <span>선택</span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트 상세</h3>
        <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='userId' required>
              회원 ID (userId)
            </Label>
            <Input
              type='number'
              id='userId'
              placeholder='직접 입력 or 검색 후 선택'
              value={userId}
              onChange={handleUserIdChange}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='difference' required>
              포인트 지급/차감량
            </Label>
            <Input
              type='number'
              id='difference'
              value={difference}
              onChange={(e) => setDifference(Number(e.target.value) || 0)}
            />
            <p className='text-xs text-gray-500'>
              양수 또는 음수만 입력 가능 (예: 20, -50)
            </p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='category' required>
              포인트 유형
            </Label>
            <Select
              onValueChange={(selectedKey: keyof typeof POINT_CATEGORY | '') =>
                setSelectedCategory(selectedKey)
              }
              value={selectedCategory ?? undefined}
            >
              <SelectTrigger className='w-full'>
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
          <div className='flex flex-col gap-1'>
            <Label htmlFor='memo'>메모</Label>
            <Input
              type='text'
              id='memo'
              placeholder='이벤트 당첨 포인트 지급, 시험 후기 오류 제보 등'
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>
      </article>

      <div className='flex justify-end gap-2'>
        <Button
          type='submit'
          size='lg'
          variant='outline'
          onClick={handleResetButtonClick}
          className='text-md h-10 w-32 cursor-pointer font-bold text-red-400 hover:text-red-400 active:text-red-600'
        >
          초기화
        </Button>
        <Button
          type='submit'
          size='lg'
          variant='outline'
          className='text-md h-10 w-32 cursor-pointer font-bold'
        >
          적용
        </Button>
      </div>
    </div>
  );
}
