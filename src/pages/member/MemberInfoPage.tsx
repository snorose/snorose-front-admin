import { useCallback, useState, useMemo } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { PageHeader } from '@/components';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import type { MemberInfo } from '@/types';
import { TabList, getMemberInfoTabs } from '@/domains/MemberInfo';

const MEMBER_INFO: { label: string; key: keyof MemberInfo }[] = [
  { label: '이름', key: 'userName' },
  { label: '회원 ID', key: 'userId' },
  { label: '학번', key: 'studentNumber' },
  { label: '회원 등급', key: 'userRoleId' },
  { label: '전공', key: 'major' },
  { label: '이메일', key: 'email' },
  { label: '아이디', key: 'loginId' },
  { label: '닉네임', key: 'nickname' },
  { label: '생년월일', key: 'birthday' },
  { label: '경고 횟수', key: 'warningCount' },
  { label: '가입일', key: 'joinedAt' },
  { label: '강등여부', key: 'blacklistType' },
  { label: '등업일', key: 'upgradedAt' },
  { label: '강등 날짜', key: 'blacklistCreatedAt' },
  { label: '현재 포인트', key: 'balance' },
  { label: '강등 종료 날짜', key: 'blacklistDeadline' },
];

export default function MemberInfoPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSelectedMember(null);
      setErrorMessage('');
      return;
    }
    const found = MEMBER_SAMPLE_DATA.find((member) => {
      const loginId = member.loginId?.toLowerCase() ?? '';
      const studentNumber = member.studentNumber?.toLowerCase() ?? '';

      return loginId === query || studentNumber === query;
    });
    if (found) {
      setSelectedMember(found);
      setErrorMessage('');
    } else {
      setSelectedMember(null);
      setErrorMessage('사용자가 존재하지 않아요');
    }
  }, [searchQuery]);

  const tabs = useMemo(() => {
    if (!selectedMember) return [];
    return getMemberInfoTabs(
      selectedMember.loginId,
      selectedMember.studentNumber
    );
  }, [selectedMember]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='회원 상세 조회'
        description='회원 정보를 조회할 수 있어요.'
      />
      <div className='flex gap-2'>
        <Input
          type='text'
          placeholder='아이디, 학번을 입력해주세요'
          className='w-96'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

      {selectedMember && (
        <>
          <div className='flex items-center gap-4'>
            <div className='flex flex-row'>
              <span className='text-2xl font-bold'>
                {selectedMember.loginId}
              </span>
              <span className='text-lg font-medium text-gray-600'>
                ({selectedMember.userId})
              </span>
            </div>
          </div>

          <article>
            <h3 className='mb-2 text-lg font-bold'>회원정보</h3>

            <div className='grid grid-cols-2 gap-x-5 gap-y-1'>
              {MEMBER_INFO.map(({ label, key }) => (
                <div key={key} className='flex gap-4'>
                  <Label className='w-32 text-gray-700'>{label}</Label>
                  <Input
                    className={`w-60 ${!selectedMember[key] ? 'bg-gray-100 text-gray-500' : ''}`}
                    value={selectedMember[key] ?? ''}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </article>
        </>
      )}
      {selectedMember && (
        <article className='rounded-md bg-blue-50 p-2'>
          <TabList defaultTab='point' tabs={tabs} />
        </article>
      )}
      {errorMessage && <p className='font-medium'>{errorMessage}</p>}
    </div>
  );
}
