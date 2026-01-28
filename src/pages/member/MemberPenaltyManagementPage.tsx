import { useCallback, useState, useMemo } from 'react';
import { Button, Input } from '@/shared/components/ui';
import { PageHeader } from '@/shared/components';
import { toast } from 'sonner';
import type { PenaltyUserInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import { searchUsersAPI } from '@/apis';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import {
  PenaltyUserInfoView,
  BlacklistHistoryTab,
  TabList,
  getPenaltyTabs,
} from '@/domains/MemberInfo';

export default function MemberPenaltyManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PenaltyUserInfo | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState('');

  // 회원 검색 API
  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSelectedMember(null);
      setErrorMessage('');
      toast.info('검색어를 입력해주세요.');
      return;
    }

    try {
      const data = await searchUsersAPI(query);

      if (data?.result) {
        setSelectedMember(data.result);
        setErrorMessage('');
        return;
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '회원 검색에 실패했습니다.'));

      // 에러면 데이터 없으면 찾기 (미완성 api용 - 추후 삭제)
      const mock = MEMBER_SAMPLE_DATA.find(
        (dummy) =>
          dummy.loginId.toLowerCase() === query ||
          dummy.studentNumber.toLowerCase() === query
      );

      if (mock) {
        setSelectedMember(mock);
        setErrorMessage('(MOCK) API 에러로 mock 데이터를 사용함.');
        return;
      }

      // 둘 다 없으면 null (미완성 api용 - 추후 삭제)
      setSelectedMember(null);
      setErrorMessage('사용자가 존재하지 않아요.');
    }
  }, [searchQuery]);

  const tabs = useMemo(() => {
    if (!selectedMember) return [];
    return getPenaltyTabs({ member: selectedMember });
  }, [selectedMember]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='경고 및 강등 관리'
        description='경고 및 강등 관리를 할 수 있어요.'
      />

      <section>
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
            size='sm'
            variant='outline'
            className='h-auto w-20 text-black'
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
      </section>
      {errorMessage && <p className='font-medium'>{errorMessage}</p>}

      {selectedMember && (
        <>
          <article>
            <h3 className='text-lg font-bold'>회원정보</h3>

            <div className='flex flex-row gap-4 rounded-md p-4 pb-5'>
              <div className='w-2/5'>
                <PenaltyUserInfoView member={selectedMember} />
              </div>
              <div className='w-3/5'>
                <BlacklistHistoryTab
                  encryptedUserId={selectedMember.encryptedUserId}
                  studentNumber={selectedMember.studentNumber}
                  groupSize={5}
                />
              </div>
            </div>
          </article>

          <article className='rounded-md border p-2'>
            <TabList defaultTab='warn' tabs={tabs} />
          </article>
        </>
      )}
    </div>
  );
}
