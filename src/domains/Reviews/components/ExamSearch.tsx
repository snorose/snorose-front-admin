import { useState } from 'react';

import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Select } from '@/shared/components/ui';
import { EXAM_TYPE_LIST, SEMESTER_LIST } from '@/shared/constants';

import type { ExamReviewSearchParams } from '@/domains/Reviews/types';
import {
  convertExamTypeToEnum,
  convertSemesterToEnum,
  extractYearFromSemester,
} from '@/domains/Reviews/utils';

interface ExamSearchProps {
  onSearchChange: (params: ExamReviewSearchParams) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  initialKeywordAuthor?: string;
  initialKeywordPost?: string;
  initialSort?: string;
  initialSemester?: string;
  initialExamType?: string;
  initialIsConfirmed?: boolean;
}

export default function ExamSearch({
  onSearchChange,
  initialStartDate = '',
  initialEndDate = '',
  initialKeywordAuthor = '',
  initialKeywordPost = '',
  initialSort,
  initialSemester,
  initialExamType,
  initialIsConfirmed,
}: ExamSearchProps) {
  const ALL_SELECTED = '전체';
  const CONFIRMED_SELECTED = 'CONFIRMED';
  const UNCONFIRMED_SELECTED = 'UNCONFIRMED';

  // key prop을 사용하여 prop 변경 시 컴포넌트 재초기화 (useEffect 대신)
  const searchKey = `${initialStartDate}-${initialEndDate}-${initialKeywordAuthor}-${initialKeywordPost}-${initialSort}-${initialSemester}-${initialExamType}-${initialIsConfirmed}`;

  // 내부 상태는 사용자 입력용으로만 사용
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [keywordAuthor, setKeywordAuthor] =
    useState<string>(initialKeywordAuthor);
  const [keywordPost, setKeywordPost] = useState<string>(initialKeywordPost);
  const [sort, setSort] = useState<string>(initialSort || ALL_SELECTED);
  const [semester, setSemester] = useState<string>(
    initialSemester || ALL_SELECTED
  );
  const [examType, setExamType] = useState<string>(
    initialExamType || ALL_SELECTED
  );
  const [confirmStatus, setConfirmStatus] = useState<string>(
    initialIsConfirmed === true
      ? CONFIRMED_SELECTED
      : initialIsConfirmed === false
        ? UNCONFIRMED_SELECTED
        : ALL_SELECTED
  );

  // 검색 실행 함수 (현재 상태 기반)
  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }

    onSearchChange(
      getSearchParams({
        startDate,
        endDate,
        keywordAuthor,
        keywordPost,
        sort,
        semester,
        examType,
        confirmStatus,
      })
    );
  };

  const getSearchParams = ({
    startDate: targetStartDate,
    endDate: targetEndDate,
    keywordAuthor: targetKeywordAuthor,
    keywordPost: targetKeywordPost,
    sort: targetSort,
    semester: targetSemester,
    examType: targetExamType,
    confirmStatus: targetConfirmStatus,
  }: {
    startDate: string;
    endDate: string;
    keywordAuthor: string;
    keywordPost: string;
    sort: string;
    semester: string;
    examType: string;
    confirmStatus: string;
  }) => {
    const params: ExamReviewSearchParams = {};

    if (targetStartDate) {
      params.startDate = targetStartDate;
    }

    if (targetEndDate) {
      params.endDate = targetEndDate;
    }

    if (targetKeywordAuthor.trim()) {
      params.keywordAuthor = targetKeywordAuthor.trim();
    }

    if (targetKeywordPost.trim()) {
      params.keywordPost = targetKeywordPost.trim();
    }

    if (targetSort && targetSort !== ALL_SELECTED) {
      params.sort = targetSort;
    }

    if (targetSemester && targetSemester !== ALL_SELECTED) {
      params.semester = convertSemesterToEnum(targetSemester);
      const year = extractYearFromSemester(targetSemester);
      if (year) {
        params.lectureYear = year;
      }
    }

    if (targetExamType && targetExamType !== ALL_SELECTED) {
      params.examType = convertExamTypeToEnum(targetExamType);
    }

    if (targetConfirmStatus === CONFIRMED_SELECTED) {
      params.isConfirmed = true;
    }

    if (targetConfirmStatus === UNCONFIRMED_SELECTED) {
      params.isConfirmed = false;
    }

    return params;
  };

  const handleSearchWithParams = (
    nextParams: Partial<{
      startDate: string;
      endDate: string;
      keywordAuthor: string;
      keywordPost: string;
      sort: string;
      semester: string;
      examType: string;
      confirmStatus: string;
    }>
  ) => {
    onSearchChange(
      getSearchParams({
        startDate,
        endDate,
        keywordAuthor,
        keywordPost,
        sort,
        semester,
        examType,
        confirmStatus,
        ...nextParams,
      })
    );
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 키워드 리셋 핸들러
  const handleKeywordPostReset = () => {
    setKeywordPost('');
    handleSearchWithParams({ keywordPost: '' });
  };

  const handleKeywordAuthorReset = () => {
    setKeywordAuthor('');
    handleSearchWithParams({ keywordAuthor: '' });
  };

  // 검색 옵션 초기화 핸들러
  const handleSearchOptionReset = () => {
    setStartDate('');
    setEndDate('');
    setKeywordAuthor('');
    setKeywordPost('');
    setSort(ALL_SELECTED);
    setSemester(ALL_SELECTED);
    setExamType(ALL_SELECTED);
    setConfirmStatus(ALL_SELECTED);
    onSearchChange({});
  };

  return (
    <div key={searchKey} className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative w-[220px]'>
          <input
            type='text'
            placeholder='시험후기 검색'
            value={keywordPost}
            onChange={(e) => setKeywordPost(e.target.value)}
            onKeyDown={handleKeyDown}
            className='h-9 w-full rounded-md border-1 border-gray-500 bg-white px-2 py-2 pr-7 text-[13px]'
          />
          {keywordPost && (
            <button
              onClick={handleKeywordPostReset}
              className='absolute top-1/2 right-2 z-10 flex -translate-y-1/2 items-center justify-center rounded-sm p-0.5 hover:bg-gray-200'
              type='button'
            >
              <X className='pointer-events-none h-4 w-4 text-gray-600' />
            </button>
          )}
        </div>
        <div className='relative w-[180px]'>
          <input
            type='text'
            placeholder='작성자 검색'
            value={keywordAuthor}
            onChange={(e) => setKeywordAuthor(e.target.value)}
            onKeyDown={handleKeyDown}
            className='h-9 w-full rounded-md border-1 border-gray-500 bg-white px-2 py-2 pr-7 text-[13px]'
          />
          {keywordAuthor && (
            <button
              onClick={handleKeywordAuthorReset}
              className='absolute top-1/2 right-2 z-10 flex -translate-y-1/2 items-center justify-center rounded-sm p-0.5 hover:bg-gray-200'
              type='button'
            >
              <X className='pointer-events-none h-4 w-4 text-gray-600' />
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>조회</Button>
        <Button variant='outline' onClick={handleSearchOptionReset}>
          검색 옵션 초기화
        </Button>
      </div>

      {/* 필터 Select들 */}
      <div className='flex flex-wrap items-center gap-2'>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value);
            handleSearchWithParams({ sort: value });
          }}
        >
          <Select.Trigger className='h-9 w-[110px] text-xs'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content align='start'>
            <Select.Item
              value={ALL_SELECTED}
              className='text-[12px] font-medium'
            >
              정렬 전체
            </Select.Item>
            <Select.Item value='REPORT' className='text-[12px] font-medium'>
              신고순
            </Select.Item>
          </Select.Content>
        </Select>

        <Select
          value={semester}
          onValueChange={(value) => {
            setSemester(value);
            handleSearchWithParams({ semester: value });
          }}
        >
          <Select.Trigger className='h-9 w-[130px] text-xs'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content
            align='start'
            className='max-h-[200px] overflow-y-auto'
          >
            <Select.Item
              value={ALL_SELECTED}
              className='text-[12px] font-medium'
            >
              전체
            </Select.Item>
            {SEMESTER_LIST.map((sem) => (
              <Select.Item
                key={sem}
                value={sem}
                className='text-[12px] font-medium'
              >
                {sem}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <Select
          value={examType}
          onValueChange={(value) => {
            setExamType(value);
            handleSearchWithParams({ examType: value });
          }}
        >
          <Select.Trigger className='h-9 w-[100px] text-xs'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content
            align='start'
            className='max-h-[200px] overflow-y-auto'
          >
            <Select.Item
              value={ALL_SELECTED}
              className='text-[12px] font-medium'
            >
              전체
            </Select.Item>
            {EXAM_TYPE_LIST.map((type) => (
              <Select.Item
                key={type}
                value={type}
                className='text-[12px] font-medium'
              >
                {type}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <Select
          value={confirmStatus}
          onValueChange={(value) => {
            setConfirmStatus(value);
            handleSearchWithParams({ confirmStatus: value });
          }}
        >
          <Select.Trigger className='h-9 w-[110px] text-xs'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content align='start'>
            <Select.Item
              value={ALL_SELECTED}
              className='text-[12px] font-medium'
            >
              확인 전체
            </Select.Item>
            <Select.Item
              value={CONFIRMED_SELECTED}
              className='text-[12px] font-medium'
            >
              확인완료
            </Select.Item>
            <Select.Item
              value={UNCONFIRMED_SELECTED}
              className='text-[12px] font-medium'
            >
              미확인
            </Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={endDate || undefined}
          className='h-9 w-[150px] text-[13px]'
          aria-label='검색 시작일'
        />
        <span className='text-xs text-gray-500'>~</span>
        <Input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || undefined}
          className='h-9 w-[150px] text-[13px]'
          aria-label='검색 종료일'
        />
      </div>
    </div>
  );
}
