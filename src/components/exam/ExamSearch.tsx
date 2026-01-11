import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SEMESTER_LIST, EXAM_TYPE_LIST } from '@/constants/exam-table-options';

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

// semester 문자열을 enum으로 변환: "2024-1" -> "FIRST", "2024-2" -> "SECOND" 등
const convertSemesterToEnum = (
  semesterStr: string
): 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER' => {
  if (
    semesterStr.includes('1') &&
    !semesterStr.includes('여름') &&
    !semesterStr.includes('겨울')
  ) {
    return 'FIRST';
  }
  if (
    semesterStr.includes('2') &&
    !semesterStr.includes('여름') &&
    !semesterStr.includes('겨울')
  ) {
    return 'SECOND';
  }
  if (semesterStr.includes('여름')) {
    return 'SUMMER';
  }
  if (semesterStr.includes('겨울')) {
    return 'WINTER';
  }
  return 'OTHER';
};

// examType 문자열을 enum으로 변환: "중간" -> "MIDTERM", "기말" -> "FINALTERM"
const convertExamTypeToEnum = (
  examTypeStr: string
): 'MIDTERM' | 'FINALTERM' => {
  if (examTypeStr === '중간') {
    return 'MIDTERM';
  }
  return 'FINALTERM';
};

// semester 문자열에서 연도 추출: "2024-1" -> 2024
const extractYearFromSemester = (semesterStr: string): number | undefined => {
  const match = semesterStr.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : undefined;
};

export default function ExamSearch({
  onSearchChange,
  initialKeyword = '',
  initialSemester,
  initialExamType,
}: ExamSearchProps) {
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [semester, setSemester] = useState<string | undefined>(initialSemester);
  const [examType, setExamType] = useState<string | undefined>(initialExamType);

  // 초기값이 변경되면 상태 업데이트 (URL에서 읽은 값으로 동기화)
  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    setSemester(initialSemester);
  }, [initialSemester]);

  useEffect(() => {
    setExamType(initialExamType);
  }, [initialExamType]);

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
    const newSemester = undefined;
    setSemester(newSemester);
    handleSearchWithParams(null, undefined);
  };

  // examType 리셋 핸들러
  const handleExamTypeReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newExamType = undefined;
    setExamType(newExamType);
    handleSearchWithParams(undefined, null);
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='flex flex-col gap-2 py-3'>
      {/* 검색 input */}
      <div className='flex items-center gap-2'>
        <input
          type='text'
          placeholder='검색'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className='h-7 w-full rounded-md border-1 border-gray-500 bg-white px-2 py-2 text-xs'
        />
        <button
          onClick={handleSearch}
          className='hover flex h-7 w-18 items-center justify-center rounded-md border !border-gray-300 !bg-gray-100 text-[12px] font-medium !text-gray-700 transition-colors hover:border-blue-500 focus:border-blue-500'
        >
          조회
        </button>
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
            className={`relative h-7 w-[130px] text-xs focus-visible:border focus-visible:ring-0 ${
              semester ? '[&>svg]:hidden' : ''
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
                className='pointer-events-auto absolute right-2 z-10 flex items-center justify-center rounded-sm p-0.5 hover:bg-gray-200'
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
            className={`relative h-7 w-[100px] text-xs focus-visible:border focus-visible:ring-0 ${
              examType ? '[&>svg]:hidden' : ''
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
                className='pointer-events-auto absolute right-2 z-10 flex items-center justify-center rounded-sm p-0.5 hover:bg-gray-200'
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
