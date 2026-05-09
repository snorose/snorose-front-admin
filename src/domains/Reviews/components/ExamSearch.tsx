import { useState } from 'react';

import { X } from 'lucide-react';

import { Button, Select } from '@/shared/components/ui';
import { EXAM_TYPE_LIST, SEMESTER_LIST } from '@/shared/constants';

import {
  convertExamTypeToEnum,
  convertSemesterToEnum,
  extractYearFromSemester,
} from '@/domains/Reviews/utils';

interface ExamSearchProps {
  onSearchChange: (params: {
    keyword?: string;
    lectureYear?: number;
    semester?: string;
    examType?: string;
  }) => void;
  initialKeyword?: string;
  initialSemester?: string;
  initialExamType?: string;
}

export default function ExamSearch({
  onSearchChange,
  initialKeyword = '',
  initialSemester,
  initialExamType,
}: ExamSearchProps) {
  const ALL_SELECTED = '전체';

  // key prop을 사용하여 prop 변경 시 컴포넌트 재초기화 (useEffect 대신)
  const searchKey = `${initialKeyword}-${initialSemester}-${initialExamType}`;

  // 내부 상태는 사용자 입력용으로만 사용
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [semester, setSemester] = useState<string>(
    initialSemester || ALL_SELECTED
  );
  const [examType, setExamType] = useState<string>(
    initialExamType || ALL_SELECTED
  );

  // 검색 실행 함수 (현재 상태 기반)
  const handleSearch = () => {
    const params = getSearchParams(semester, examType);
    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    onSearchChange(params);
  };

  const getSearchParams = (targetSemester: string, targetExamType: string) => {
    const params: {
      keyword?: string;
      lectureYear?: number;
      semester?: string;
      examType?: string;
    } = {};

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

    return params;
  };

  const handleSearchWithParams = (
    nextSemester: string,
    nextExamType: string
  ) => {
    const params: {
      keyword?: string;
      lectureYear?: number;
      semester?: string;
      examType?: string;
    } = {};

    // 현재 keyword 포함
    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (nextSemester && nextSemester !== ALL_SELECTED) {
      params.semester = convertSemesterToEnum(nextSemester);
      const year = extractYearFromSemester(nextSemester);
      if (year) {
        params.lectureYear = year;
      }
    }

    if (nextExamType && nextExamType !== ALL_SELECTED) {
      params.examType = convertExamTypeToEnum(nextExamType);
    }

    onSearchChange(params);
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 키워드 리셋 핸들러
  const handleKeywordReset = () => {
    setKeyword('');
    const params = getSearchParams(semester, examType);

    onSearchChange(params);
  };

  // 검색 옵션 초기화 핸들러
  const handleSearchOptionReset = () => {
    setKeyword('');
    setSemester(ALL_SELECTED);
    setExamType(ALL_SELECTED);
    onSearchChange({});
  };

  return (
    <div key={searchKey} className='flex flex-col gap-2'>
      {/* 검색 input */}
      <div className='flex items-center gap-2'>
        <div className='relative w-full'>
          <input
            type='text'
            placeholder='시험후기명, 강의명, 교수명을 검색해주세요.'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className='h-9 w-full min-w-80 rounded-md border-1 border-gray-500 bg-white px-2 py-2 pr-7 text-[13px]'
          />
          {keyword && (
            <button
              onClick={handleKeywordReset}
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
      <div className='flex items-center gap-2'>
        <Select
          value={semester}
          onValueChange={(value) => {
            setSemester(value);
            handleSearchWithParams(value, examType);
          }}
        >
          <Select.Trigger className='!h-7 w-[130px] text-xs'>
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
            handleSearchWithParams(semester, value);
          }}
        >
          <Select.Trigger className='!h-7 w-[100px] text-xs'>
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
      </div>
    </div>
  );
}
