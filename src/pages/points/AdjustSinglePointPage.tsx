import { useState } from 'react';

import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Button, Input } from '@/shared/components/ui';
import { POINT_CATEGORY_OPTIONS } from '@/shared/constants';
import type { MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  MemberInfoSection,
  PointActionButtons,
  PointAdjustmentConfirmModal,
  PointDetailSection,
} from '@/domains/Points/components';

import { postSinglePointAPI, searchUsersAPI } from '@/apis';

export default function AdjustSinglePointPage() {
  const [searchedMember, setSearchedMember] = useState<MemberInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof POINT_CATEGORY_OPTIONS)[number]['value'] | ''
  >('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [difference, setDifference] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSearchButtonClick = async () => {
    if (!searchQuery.trim()) {
      toast.info('검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchUsersAPI(searchQuery.trim());
      setSearchedMember(data.result);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '회원 검색에 실패했습니다.'));
      setSearchedMember(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResetButtonClick = () => {
    setSearchedMember(null);
    setSelectedCategory('');
    setSearchQuery('');
    setDifference('');
    setMemo('');
  };

  const handleConfirmModalButtonClick = async () => {
    if (!searchedMember) {
      return;
    }

    try {
      const numDifference = Number(difference);

      await postSinglePointAPI({
        encryptedUserId: searchedMember.encryptedUserId,
        difference: numDifference,
        category: selectedCategory,
        source: 'ADMIN',
        ...(memo && { memo }),
      });

      toast.success('포인트 지급/차감이 완료되었어요.');
      handleResetButtonClick();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '포인트 지급/차감에 실패했어요.'));
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='단일건 포인트 지급/차감'
        description='특정 회원에게 포인트를 지급/차감할 수 있어요.'
      />
      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>회원 검색</h3>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='아이디 또는 학번을 입력해주세요.'
            className='w-96'
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchButtonClick();
              }
            }}
          />
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='h-auto w-20 cursor-pointer text-black'
            onClick={handleSearchButtonClick}
            disabled={isSearching}
          >
            {isSearching ? '검색중..' : '검색'}
          </Button>
        </div>
      </article>

      <MemberInfoSection searchedMember={searchedMember} />

      <PointDetailSection
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        difference={difference}
        onDifferenceChange={setDifference}
        memo={memo}
        onMemoChange={setMemo}
      />

      <PointActionButtons
        encryptedUserId={searchedMember?.encryptedUserId ?? null}
        selectedCategory={selectedCategory}
        difference={difference}
        memo={memo}
        onReset={handleResetButtonClick}
        onApply={() => setIsConfirmModalOpen(true)}
      />

      {searchedMember && (
        <PointAdjustmentConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmModalButtonClick}
          searchedMember={searchedMember as MemberInfo}
          selectedCategory={selectedCategory}
          difference={difference}
          memo={memo}
        />
      )}
    </div>
  );
}
