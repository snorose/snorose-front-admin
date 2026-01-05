import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components';
import type { MemberInfo } from '@/types';
import { POINT_CATEGORY } from '@/constants';
import { toast } from 'sonner';
import { postSinglePointAPI, searchUsersAPI } from '@/apis';
import { useAuth } from '@/hooks';
import {
  ConfirmPointAdjustmentModal,
  MemberInfoSection,
  PointDetailSection,
} from '@/domains/Points';

export default function AdjustSinglePointPage() {
  const { user } = useAuth();
  const [searchedMember, setSearchedMember] = useState<MemberInfo | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof POINT_CATEGORY | ''
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

      if (!data.isSuccess) {
        toast.error(data.message || '회원 조회에 실패했습니다.');
        setSearchedMember(null);
        return;
      }

      if (!data.result || data.result.length === 0) {
        toast.info('조회된 회원이 없습니다.');
        setSearchedMember(null);
        return;
      }

      setSearchedMember(data.result);
      setUserId(data.result.userId);
    } catch {
      toast.error('회원 조회에 실패했습니다.');
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
    setUserId(null);
    setSelectedCategory('');
    setSearchQuery('');
    setDifference('');
    setMemo('');
  };

  const handleApplyButtonClick = () => {
    if (!userId || !setSearchedMember || !selectedCategory || !difference) {
      toast.info('모든 필수 항목을 입력해주세요.');
      return;
    }
    const numDifference = Number(difference);

    if (isNaN(numDifference) || numDifference === 0) {
      toast.info('유효한 포인트 지급/차감량을 입력해주세요.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmModalButtonClick = async () => {
    try {
      const numDifference = Number(difference);

      await postSinglePointAPI({
        userId: userId as number,
        difference: numDifference,
        category: selectedCategory as keyof typeof POINT_CATEGORY,
        sourceId: user?.userId,
        source: 'ADMIN',
        ...(memo && { memo }),
      });

      toast.success('포인트 지급/차감이 완료되었습니다.');
      handleResetButtonClick();
    } catch {
      toast.error('포인트 지급/차감에 실패했습니다.');
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
        <h3 className='text-lg font-bold'>회원 조회</h3>
        <div className='flex gap-2'>
          <Input
            type='text'
            placeholder='아이디 또는 학번을 입력해주세요'
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

      <MemberInfoSection
        searchedMember={searchedMember as MemberInfo}
        userId={userId as number}
        onUserIdChange={setUserId}
      />

      <PointDetailSection
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        difference={difference}
        onDifferenceChange={setDifference}
        memo={memo}
        onMemoChange={setMemo}
      />

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
          onClick={handleApplyButtonClick}
        >
          적용
        </Button>
      </div>

      {searchedMember && (
        <ConfirmPointAdjustmentModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmModalButtonClick}
          searchedMember={searchedMember as MemberInfo}
          selectedCategory={selectedCategory as keyof typeof POINT_CATEGORY}
          difference={difference}
          memo={memo}
        />
      )}
    </div>
  );
}
