import { useCallback, useId, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Button, Input, Label } from '@/shared/components/ui';
import type { PenaltyUserInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  BlacklistHistoryTab,
  PenaltyUserInfoView,
  TabList,
  getPenaltyTabs,
} from '@/domains/MemberInfo';

import { getUserDetailAPI, searchUsersAPI } from '@/apis';

export default function MemberPenaltyManagementPage() {
  const searchId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PenaltyUserInfo | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // 회원 검색 API
  const handleSearch = useCallback(async () => {
    if (isSearching) return;
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSelectedMember(null);
      setErrorMessage('');
      toast.info('검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const member = await searchUsersAPI(query);

      if (member) {
        setSelectedMember(member);
        setErrorMessage('');
        return;
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '회원 검색에 실패했습니다.'));
      setSelectedMember(null);
      setErrorMessage('데이터가 없습니다');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, searchQuery]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearch();
  };

  const handlePenaltyApplied = useCallback(async () => {
    setHistoryRefreshKey((prev) => prev + 1);
    if (!selectedMember) return;

    const targetUserId = selectedMember.encryptedUserId;
    try {
      const member = await getUserDetailAPI(targetUserId);
      setSelectedMember((currentMember) =>
        currentMember?.encryptedUserId === targetUserId ? member : currentMember
      );
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '변경된 회원 상태를 불러오지 못했습니다.')
      );
    }
  }, [selectedMember]);

  const tabs = useMemo(() => {
    if (!selectedMember) return [];
    return getPenaltyTabs({
      member: selectedMember,
      onApplied: handlePenaltyApplied,
    });
  }, [handlePenaltyApplied, selectedMember]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='경고 및 강등 관리'
        description='경고 및 강등 관리를 할 수 있어요.'
      />

      <section>
        <Label htmlFor={searchId} className='sr-only'>
          회원 검색 (아이디 또는 학번)
        </Label>
        <form className='flex flex-wrap gap-2' onSubmit={handleSearchSubmit}>
          <Input
            id={searchId}
            aria-describedby={errorMessage ? `${searchId}-error` : undefined}
            type='text'
            placeholder='아이디, 학번을 입력해주세요'
            className='max-w-96 min-w-0 flex-1'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type='submit' className='w-20' disabled={isSearching}>
            {isSearching ? '검색 중...' : '검색'}
          </Button>
        </form>
      </section>
      {errorMessage && (
        <p id={`${searchId}-error`} role='alert' className='font-medium'>
          {errorMessage}
        </p>
      )}

      <article>
        <h3 className='text-lg font-bold'>회원정보</h3>

        <div className='flex flex-row gap-4 rounded-md p-4 pb-5'>
          <div className='w-2/5'>
            <PenaltyUserInfoView member={selectedMember} />
          </div>
          <div className='w-3/5'>
            <BlacklistHistoryTab
              encryptedUserId={selectedMember?.encryptedUserId}
              studentNumber={selectedMember?.studentNumber}
              groupSize={5}
              refreshKey={historyRefreshKey}
            />
          </div>
        </div>
      </article>

      <article className='rounded-md border p-2'>
        <TabList defaultTab='warn' tabs={tabs} />
      </article>
    </div>
  );
}
