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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { PageHeader } from '@/components';
import type { MemberInfo } from '@/types';
import { cn } from '@/utils';
import { POINT_CATEGORY } from '@/constants';
import { toast } from 'sonner';
import { postSinglePointAPI, searchUsersAPI } from '@/apis';
import { useAuth } from '@/hooks';

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

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>회원 정보 상세</h3>
        <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='userName' required>
              이름
            </Label>
            <Input
              type='text'
              id='userName'
              placeholder='검색 후 회원을 선택해주세요'
              value={searchedMember?.userName ?? ''}
              readOnly
              className='bg-gray-50'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='major' required>
              전공
            </Label>
            <Input
              type='text'
              id='major'
              placeholder='검색 후 회원을 선택해주세요'
              value={searchedMember?.major ?? ''}
              readOnly
              className='bg-gray-50'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='loginId' required>
              아이디
            </Label>
            <Input
              type='text'
              id='loginId'
              placeholder='검색 후 회원을 선택해주세요'
              value={searchedMember?.loginId ?? ''}
              readOnly
              className='bg-gray-50'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='studentNumber' required>
              학번
            </Label>
            <Input
              type='text'
              id='studentNumber'
              placeholder='검색 후 회원을 선택해주세요'
              value={searchedMember?.studentNumber ?? ''}
              readOnly
              className='bg-gray-50'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='userId' required>
              userId
            </Label>
            <Input
              type='text'
              id='userId'
              placeholder='직접 입력'
              value={userId ?? ''}
              onChange={(e) => setUserId(Number(e.target.value))}
            />
          </div>
        </div>
      </article>

      <article className='flex flex-col gap-1'>
        <h3 className='text-lg font-bold'>지급할 포인트 상세</h3>
        <div className='grid w-full grid-cols-2 gap-4 rounded-md border p-4'>
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
            <Label htmlFor='difference' required>
              포인트 지급/차감량
            </Label>
            <Input
              type='number'
              id='difference'
              value={difference}
              placeholder='양수 또는 음수만 입력 가능 (예: 20, -50)'
              onChange={(e) => setDifference(e.target.value)}
            />
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
          onClick={handleApplyButtonClick}
        >
          적용
        </Button>
      </div>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>포인트 지급/차감 확인</DialogTitle>
            <DialogDescription>
              아래 내용으로 포인트를 적용하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-3 py-4'>
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>아이디:</span>
              <span className='text-sm'>{searchedMember?.loginId}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>이름:</span>
              <span className='text-sm'>{searchedMember?.userName}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>학과:</span>
              <span className='text-sm'>{searchedMember?.major}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>학번:</span>
              <span className='text-sm'>{searchedMember?.studentNumber}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>포인트 유형:</span>
              <span className='text-sm'>
                {selectedCategory && POINT_CATEGORY[selectedCategory]}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-24 text-sm font-semibold'>포인트:</span>
              <span
                className={cn(
                  'text-sm',
                  Number(difference) > 0 ? 'text-blue-600' : 'text-red-600'
                )}
              >
                {Number(difference) > 0 ? '+' : ''}
                {difference}
              </span>
            </div>
            {memo && (
              <div className='flex items-center gap-2'>
                <span className='w-24 text-sm font-semibold'>메모:</span>
                <span className='text-sm'>{memo}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsConfirmModalOpen(false)}
            >
              취소
            </Button>
            <Button type='button' onClick={handleConfirmModalButtonClick}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
