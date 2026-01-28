import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from '@/components/ui';
import { SEMESTER_LIST, EXAM_TYPE_LIST } from '@/constants';
import {
  convertSemesterToEnum,
  convertExamTypeToEnum,
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
  // key prop을 사용하여 prop 변경 시 컴포넌트 재초기화 (useEffect 대신)
  const searchKey = `${initialKeyword}-${initialSemester}-${initialExamType}`;

  // 내부 상태는 사용자 입력용으로만 사용
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [semester, setSemester] = useState<string | undefined>(initialSemester);
  const [examType, setExamType] = useState<string | undefined>(initialExamType);

  // 검색 실행 함수 (현재 상태 기반)
  const handleSearch = () => {
    const params: {
      keyword?: string;
      lectureYear?: number;
      semester?: string;
      examType?: string;
    } = {};

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    // semester 선택 시 연도도 함께 설정
    if (semester) {
      params.semester = convertSemesterToEnum(semester);
      const year = extractYearFromSemester(semester);
      if (year) {
        params.lectureYear = year;
      }
    }

    if (examType) {
      params.examType = convertExamTypeToEnum(examType);
    }

    onSearchChange(params);
  };

  // 검색 실행 함수 (파라미터로 새 값 받기)
  const handleSearchWithParams = (
    newSemester?: string | undefined | null,
    newExamType?: string | undefined | null
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

    // 새 semester 값 사용 (null이면 리셋, undefined면 현재 값 유지)
    const currentSemester =
      newSemester === null
        ? undefined
        : newSemester !== undefined
          ? newSemester
          : semester;
    if (currentSemester) {
      params.semester = convertSemesterToEnum(currentSemester);
      const year = extractYearFromSemester(currentSemester);
      if (year) {
        params.lectureYear = year;
      }
    }

    // 새 examType 값 사용 (null이면 리셋, undefined면 현재 값 유지)
    const currentExamType =
      newExamType === null
        ? undefined
        : newExamType !== undefined
          ? newExamType
          : examType;
    if (currentExamType) {
      params.examType = convertExamTypeToEnum(currentExamType);
    }

    onSearchChange(params);
  };

  // semester 리셋 핸들러
  const handleSemesterReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSemester(undefined);
    handleSearchWithParams(null, undefined);
  };

  // examType 리셋 핸들러
  const handleExamTypeReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExamType(undefined);
    handleSearchWithParams(undefined, null);
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

    const params: {
      keyword?: string;
      lectureYear?: number;
      semester?: string;
      examType?: string;
    } = {};

    if (semester) {
      params.semester = convertSemesterToEnum(semester);
      const year = extractYearFromSemester(semester);
      if (year) {
        params.lectureYear = year;
      }
    }

    if (examType) {
      params.examType = convertExamTypeToEnum(examType);
    }

    onSearchChange(params);
  };

  // 검색 옵션 초기화 핸들러
  const handleSearchOptionReset = () => {
    setKeyword('');
    setSemester(undefined);
    setExamType(undefined);
    onSearchChange({});
  };

  return (
    <div key={searchKey} className='flex flex-col gap-2'>
      {/* 검색 input */}
      <div className='flex items-center gap-2'>
        <div className='relative w-full'>
          <input
            type='text'
            placeholder='키워드를 입력하세요'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className='h-8 w-full min-w-80 rounded-md border-1 border-gray-500 bg-white px-2 py-2 pr-7 text-[13px]'
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
        <Button
          onClick={handleSearch}
          className='hover flex h-8 w-18 items-center justify-center rounded-md border bg-gray-700 text-[12px] font-medium transition-colors hover:bg-gray-700'
        >
          조회
        </Button>
        <Button
          variant='secondary'
          onClick={handleSearchOptionReset}
          className='hover flex h-8 items-center justify-center rounded-md border border-gray-300 text-[12px] font-medium transition-colors hover:bg-gray-200'
        >
          검색 옵션 초기화
        </Button>
      </div>

      {/* 필터 Select들 */}
      <div className='flex items-center gap-2'>
        <Select
          key={semester || 'empty-semester'}
          value={semester || undefined}
          onValueChange={(value) => {
            setSemester(value);
            handleSearchWithParams(value, undefined);
          }}
        >
          <SelectTrigger
            className={`relative !h-7 w-[130px] text-xs focus-visible:border focus-visible:ring-0 ${
              semester ? '!bg-blue-100 [&>svg]:hidden' : ''
            }`}
          >
            <SelectValue placeholder='학기 선택' />
            {semester && (
              <button
                onClick={handleSemesterReset}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className='pointer-events-auto absolute right-2 z-10 flex items-center justify-center rounded-sm p-0.5 hover:bg-blue-200/80'
                type='button'
              >
                <X className='pointer-events-none h-3 w-3 text-gray-600' />
              </button>
            )}
          </SelectTrigger>
          <SelectContent
            align='start'
            className='max-h-[200px] overflow-y-auto bg-blue-50 text-[10px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
          >
            {SEMESTER_LIST.map((sem) => (
              <SelectItem
                key={sem}
                value={sem}
                className='text-[12px] font-medium'
              >
                {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          key={examType || 'empty-examtype'}
          value={examType || undefined}
          onValueChange={(value) => {
            setExamType(value);
            handleSearchWithParams(undefined, value);
          }}
        >
          <SelectTrigger
            className={`relative !h-7 w-[100px] text-xs focus-visible:border focus-visible:ring-0 ${
              examType ? '!bg-blue-100 [&>svg]:hidden' : ''
            }`}
          >
            <SelectValue placeholder='시험 종류' />
            {examType && (
              <button
                onClick={handleExamTypeReset}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className='pointer-events-auto absolute right-2 z-10 flex items-center justify-center rounded-sm p-0.5 hover:bg-blue-200/80'
                type='button'
              >
                <X className='pointer-events-none h-3 w-3 text-gray-600' />
              </button>
            )}
          </SelectTrigger>
          <SelectContent
            align='start'
            className='max-h-[200px] overflow-y-auto bg-blue-50 text-[10px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
          >
            {EXAM_TYPE_LIST.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className='text-[12px] font-medium'
              >
                {type === '중간' ? '중간고사' : '기말고사'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
