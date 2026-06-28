import { useState } from 'react';

import { ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Select } from '@/shared/components/ui';
import {
  EXAM_REVIEW_PROCESS_STATUS,
  EXAM_TYPE_LIST,
  SEMESTER_LIST,
} from '@/shared/constants';

import {
  type ExamReviewSearchParams,
  isExamReviewSort,
} from '@/domains/Reviews/types';
import {
  convertExamTypeToEnum,
  convertSemesterToEnum,
  extractYearFromSemester,
} from '@/domains/Reviews/utils';

import { ExamConfirmStatusBadge } from './ExamConfirmStatusBadge';
import { ExamMultiSelect } from './ExamMultiSelect';

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
  initialIsDiscussed?: boolean;
  initialIsReported?: boolean;
  initialStatuses?: string;
}

const ALL_SELECTED = '전체';
const TRUE_SELECTED = 'TRUE';
const FALSE_SELECTED = 'FALSE';
const CONFIRMED_SELECTED = 'CONFIRMED';
const UNCONFIRMED_SELECTED = 'UNCONFIRMED';
const PROCESS_STATUS_OPTIONS: string[] = EXAM_REVIEW_PROCESS_STATUS.map(
  (status) => status.label
);

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;

const getBooleanFilterValue = (value?: boolean): string => {
  if (value === true) {
    return TRUE_SELECTED;
  }

  if (value === false) {
    return FALSE_SELECTED;
  }

  return ALL_SELECTED;
};

const getStatusLabelsFromCodes = (statuses?: string): string[] => {
  if (!statuses) {
    return [];
  }

  return statuses
    .split(',')
    .map((status) => status.trim())
    .map((statusCode) => {
      return EXAM_REVIEW_PROCESS_STATUS.find(
        (status) => status.code === statusCode
      )?.label;
    })
    .filter(isDefined);
};

const getStatusCodesFromLabels = (statusLabels: string[]): string =>
  statusLabels
    .map((statusLabel) => {
      return EXAM_REVIEW_PROCESS_STATUS.find(
        (status) => status.label === statusLabel
      )?.code;
    })
    .filter(isDefined)
    .join(',');

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
  initialIsDiscussed,
  initialIsReported,
  initialStatuses,
}: ExamSearchProps) {
  // key prop을 사용하여 prop 변경 시 컴포넌트 재초기화 (useEffect 대신)
  const searchKey = `${initialStartDate}-${initialEndDate}-${initialKeywordAuthor}-${initialKeywordPost}-${initialSort}-${initialSemester}-${initialExamType}-${initialIsConfirmed}-${initialIsDiscussed}-${initialIsReported}-${initialStatuses}`;

  // 내부 상태는 사용자 입력용으로만 사용
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [keywordAuthor, setKeywordAuthor] =
    useState<string>(initialKeywordAuthor);
  const [keywordPost, setKeywordPost] = useState<string>(initialKeywordPost);
  const [sort, setSort] = useState<string>(
    isExamReviewSort(initialSort) ? initialSort : ALL_SELECTED
  );
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
  const [discussionStatus, setDiscussionStatus] = useState<string>(
    getBooleanFilterValue(initialIsDiscussed)
  );
  const [reportStatus, setReportStatus] = useState<string>(
    initialIsReported === true ? TRUE_SELECTED : ALL_SELECTED
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    getStatusLabelsFromCodes(initialStatuses)
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
        discussionStatus,
        reportStatus,
        selectedStatuses,
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
    discussionStatus: targetDiscussionStatus,
    reportStatus: targetReportStatus,
    selectedStatuses: targetSelectedStatuses,
  }: {
    startDate: string;
    endDate: string;
    keywordAuthor: string;
    keywordPost: string;
    sort: string;
    semester: string;
    examType: string;
    confirmStatus: string;
    discussionStatus: string;
    reportStatus: string;
    selectedStatuses: string[];
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

    if (isExamReviewSort(targetSort)) {
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

    if (targetDiscussionStatus === TRUE_SELECTED) {
      params.isDiscussed = true;
    }

    if (targetDiscussionStatus === FALSE_SELECTED) {
      params.isDiscussed = false;
    }

    if (targetReportStatus === TRUE_SELECTED) {
      params.isReported = true;
    }

    const statuses = getStatusCodesFromLabels(targetSelectedStatuses);
    if (statuses) {
      params.statuses = statuses;
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
      discussionStatus: string;
      reportStatus: string;
      selectedStatuses: string[];
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
        discussionStatus,
        reportStatus,
        selectedStatuses,
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
    setDiscussionStatus(ALL_SELECTED);
    setReportStatus(ALL_SELECTED);
    setSelectedStatuses([]);
    onSearchChange({});
  };

  return (
    <div key={searchKey} className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative w-[220px]'>
          <input
            type='text'
            placeholder='시험후기명 검색'
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
        <div className='relative w-[260px]'>
          <input
            type='text'
            placeholder='작성자 검색 (아이디, 닉네임, 학번)'
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
        <div className='flex items-center gap-2'>
          <Button onClick={handleSearch}>조회</Button>
          <Button variant='outline' onClick={handleSearchOptionReset}>
            검색 옵션 초기화
          </Button>
        </div>
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
          <Select.Trigger className='h-9 w-[150px] text-sm'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content align='start'>
            <Select.Item value={ALL_SELECTED} className='text-sm'>
              게시일 최신순
            </Select.Item>
            <Select.Item value='ASC' className='text-sm'>
              제목 오름차순
            </Select.Item>
            <Select.Item value='DESC' className='text-sm'>
              제목 내림차순
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
          <Select.Trigger className='h-9 w-[150px] text-sm'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content
            align='start'
            className='max-h-[200px] overflow-y-auto'
          >
            <Select.Item value={ALL_SELECTED} className='text-sm'>
              강의 연도
            </Select.Item>
            {SEMESTER_LIST.map((sem) => (
              <Select.Item key={sem} value={sem} className='text-sm'>
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
          <Select.Trigger className='h-9 w-[150px] text-sm'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content
            align='start'
            className='max-h-[200px] overflow-y-auto'
          >
            <Select.Item value={ALL_SELECTED} className='text-sm'>
              시험 종류
            </Select.Item>
            {EXAM_TYPE_LIST.map((type) => (
              <Select.Item key={type} value={type} className='text-sm'>
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
          <Select.Trigger className='h-9 w-[150px] text-sm'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content align='start'>
            <Select.Item value={ALL_SELECTED} className='text-sm'>
              확인 상태 전체
            </Select.Item>
            <Select.Item
              value={CONFIRMED_SELECTED}
              className='text-sm'
              textValue='확인완료'
            >
              <ExamConfirmStatusBadge status={CONFIRMED_SELECTED} />
            </Select.Item>
            <Select.Item
              value={UNCONFIRMED_SELECTED}
              className='text-sm'
              textValue='미확인'
            >
              <ExamConfirmStatusBadge status={UNCONFIRMED_SELECTED} />
            </Select.Item>
          </Select.Content>
        </Select>

        <Select
          value={discussionStatus}
          onValueChange={(value) => {
            setDiscussionStatus(value);
            handleSearchWithParams({ discussionStatus: value });
          }}
        >
          <Select.Trigger className='h-9 w-[150px] text-sm'>
            <Select.Value />
          </Select.Trigger>
          <Select.Content align='start'>
            <Select.Item value={ALL_SELECTED} className='text-sm'>
              논의 여부 전체
            </Select.Item>
            <Select.Item value={TRUE_SELECTED} className='text-sm'>
              논의 있음
            </Select.Item>
            <Select.Item value={FALSE_SELECTED} className='text-sm'>
              논의 없음
            </Select.Item>
          </Select.Content>
        </Select>

        <ExamMultiSelect
          value={selectedStatuses}
          onValueChange={(value) => {
            setSelectedStatuses(value);
            handleSearchWithParams({ selectedStatuses: value });
          }}
          options={PROCESS_STATUS_OPTIONS}
          contentClassName='w-[190px]'
        >
          <Button
            type='button'
            variant='outline'
            className='border-input h-9 w-[190px] justify-between bg-transparent px-3 text-sm font-normal hover:bg-transparent'
          >
            <span className='truncate'>
              {selectedStatuses.length > 0
                ? `처리 상태 ${selectedStatuses.length}개`
                : '처리 상태 전체'}
            </span>
            <ChevronDown className='size-4 opacity-50' />
          </Button>
        </ExamMultiSelect>

        <label className='border-input flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-white px-3 text-sm font-normal'>
          <input
            type='checkbox'
            checked={reportStatus === TRUE_SELECTED}
            onChange={(e) => {
              const nextReportStatus = e.target.checked
                ? TRUE_SELECTED
                : ALL_SELECTED;
              setReportStatus(nextReportStatus);
              handleSearchWithParams({ reportStatus: nextReportStatus });
            }}
            className='relative h-3.5 w-3.5 shrink-0 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-transparent checked:border-blue-500 checked:bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[9px] checked:before:text-white checked:before:content-["✓"]'
          />
          <span>신고 있음</span>
        </label>
      </div>
    </div>
  );
}
