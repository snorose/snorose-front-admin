import { useId, useState } from 'react';

import { ChevronDown, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { AdvancedSearchFilters, DatePicker } from '@/shared/components';
import { Button, InputGroup, Label, Select } from '@/shared/components/ui';
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
import { ExamDiscussionStatusBadge } from './ExamDiscussionStatusBadge';
import { ExamMultiSelect } from './ExamMultiSelect';
import { ExamReviewProcessStatusBadge } from './ExamReviewProcessStatusBadge';

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

const getStatusCodeFromLabel = (statusLabel: string) =>
  EXAM_REVIEW_PROCESS_STATUS.find((status) => status.label === statusLabel)
    ?.code;

const renderDiscussionStatusBadge = (status: string) => {
  if (status === ALL_SELECTED) {
    return '전체';
  }

  return <ExamDiscussionStatusBadge isDiscussed={status === TRUE_SELECTED} />;
};

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
  const dateId = useId();
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
    <section
      key={searchKey}
      aria-labelledby={`${dateId}-heading`}
      className='flex w-full min-w-0 flex-col gap-1'
    >
      <h2 id={`${dateId}-heading`} className='text-lg font-bold'>
        시험후기 검색
      </h2>
      <div className='flex min-w-0 flex-col gap-4 rounded-md border p-4 pb-5'>
        <div className='flex min-w-0 flex-col gap-4'>
          <div className='flex flex-wrap items-end gap-2'>
            <div className='flex w-full min-w-0 flex-col gap-1 sm:w-60'>
              <Label htmlFor={`${dateId}-keywordPost`}>시험후기 검색어</Label>
              <InputGroup>
                <InputGroup.Addon>
                  <Search aria-hidden='true' />
                </InputGroup.Addon>
                <InputGroup.Input
                  type='text'
                  id={`${dateId}-keywordPost`}
                  aria-label='시험후기명 또는 postId 검색'
                  placeholder='시험후기명 또는 postId 검색'
                  value={keywordPost}
                  onChange={(e) => setKeywordPost(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {keywordPost && (
                  <InputGroup.Addon align='inline-end'>
                    <InputGroup.Button
                      onClick={handleKeywordPostReset}
                      size='icon-xs'
                      aria-label='시험후기 검색어 지우기'
                    >
                      <X aria-hidden='true' />
                    </InputGroup.Button>
                  </InputGroup.Addon>
                )}
              </InputGroup>
            </div>
            <div className='flex w-full min-w-0 flex-col gap-1 sm:w-60'>
              <Label htmlFor={`${dateId}-keywordAuthor`}>작성자</Label>
              <InputGroup>
                <InputGroup.Addon>
                  <Search aria-hidden='true' />
                </InputGroup.Addon>
                <InputGroup.Input
                  type='text'
                  id={`${dateId}-keywordAuthor`}
                  aria-label='작성자 검색 (아이디, 닉네임, 학번)'
                  placeholder='작성자 검색 (아이디, 닉네임, 학번)'
                  value={keywordAuthor}
                  onChange={(e) => setKeywordAuthor(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {keywordAuthor && (
                  <InputGroup.Addon align='inline-end'>
                    <InputGroup.Button
                      onClick={handleKeywordAuthorReset}
                      size='icon-xs'
                      aria-label='작성자 검색어 지우기'
                    >
                      <X aria-hidden='true' />
                    </InputGroup.Button>
                  </InputGroup.Addon>
                )}
              </InputGroup>
            </div>
            <fieldset className='flex w-full min-w-0 flex-col gap-1 sm:w-auto'>
              <legend className='py-1 text-sm leading-none font-semibold'>
                작성 기간
              </legend>
              <div className='flex w-full min-w-0 items-center gap-2 sm:w-auto'>
                <div className='flex min-w-0 flex-1 flex-col gap-1 sm:w-40 sm:flex-none'>
                  <Label className='sr-only' htmlFor={`${dateId}-start`}>
                    작성 시작일
                  </Label>
                  <DatePicker
                    id={`${dateId}-start`}
                    value={startDate || undefined}
                    onValueChange={(value) => setStartDate(value ?? '')}
                    maxDate={endDate || undefined}
                    placeholder='시작일'
                  />
                </div>
                <span aria-hidden='true' className='text-muted-foreground'>
                  ~
                </span>
                <div className='flex min-w-0 flex-1 flex-col gap-1 sm:w-40 sm:flex-none'>
                  <Label className='sr-only' htmlFor={`${dateId}-end`}>
                    작성 종료일
                  </Label>
                  <DatePicker
                    id={`${dateId}-end`}
                    value={endDate || undefined}
                    onValueChange={(value) => setEndDate(value ?? '')}
                    minDate={startDate || undefined}
                    placeholder='종료일'
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <AdvancedSearchFilters>
            {/* 필터 Select들 */}
            <div className='flex flex-wrap items-end gap-2'>
              <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                <Label htmlFor={`${dateId}-sort`}>정렬</Label>
                <Select value={sort} onValueChange={setSort}>
                  <Select.Trigger
                    id={`${dateId}-sort`}
                    className='h-9 w-full text-sm'
                  >
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
                    <Select.Item value='REPORT' className='text-sm'>
                      신고순
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                <Label htmlFor={`${dateId}-semester`}>강의 연도</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <Select.Trigger
                    id={`${dateId}-semester`}
                    className='h-9 w-full text-sm'
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content
                    align='start'
                    className='max-h-[200px] overflow-y-auto'
                  >
                    <Select.Item value={ALL_SELECTED} className='text-sm'>
                      전체
                    </Select.Item>
                    {SEMESTER_LIST.map((sem) => (
                      <Select.Item key={sem} value={sem} className='text-sm'>
                        {sem}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                <Label htmlFor={`${dateId}-examType`}>시험 종류</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <Select.Trigger
                    id={`${dateId}-examType`}
                    className='h-9 w-full text-sm'
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content
                    align='start'
                    className='max-h-[200px] overflow-y-auto'
                  >
                    <Select.Item value={ALL_SELECTED} className='text-sm'>
                      전체
                    </Select.Item>
                    {EXAM_TYPE_LIST.map((type) => (
                      <Select.Item key={type} value={type} className='text-sm'>
                        {type}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                <Label htmlFor={`${dateId}-confirmStatus`}>확인 상태</Label>
                <Select value={confirmStatus} onValueChange={setConfirmStatus}>
                  <Select.Trigger
                    id={`${dateId}-confirmStatus`}
                    className='h-9 w-full text-sm'
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content align='start'>
                    <Select.Item value={ALL_SELECTED} className='text-sm'>
                      전체
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
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                <Label htmlFor={`${dateId}-discussionStatus`}>논의 여부</Label>
                <Select
                  value={discussionStatus}
                  onValueChange={setDiscussionStatus}
                >
                  <Select.Trigger
                    id={`${dateId}-discussionStatus`}
                    className='h-9 w-full text-sm'
                  >
                    {renderDiscussionStatusBadge(discussionStatus)}
                  </Select.Trigger>
                  <Select.Content align='start'>
                    <Select.Item value={ALL_SELECTED} className='text-sm'>
                      전체
                    </Select.Item>
                    <Select.Item
                      value={TRUE_SELECTED}
                      className='text-sm'
                      textValue='논의 있음'
                    >
                      {renderDiscussionStatusBadge(TRUE_SELECTED)}
                    </Select.Item>
                    <Select.Item
                      value={FALSE_SELECTED}
                      className='text-sm'
                      textValue='논의 없음'
                    >
                      {renderDiscussionStatusBadge(FALSE_SELECTED)}
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className='flex w-full min-w-0 flex-col gap-1 sm:w-40'>
                <Label
                  id={`${dateId}-statuses-label`}
                  htmlFor={`${dateId}-statuses`}
                >
                  관리 상태
                </Label>
                <ExamMultiSelect
                  value={selectedStatuses}
                  onValueChange={setSelectedStatuses}
                  options={PROCESS_STATUS_OPTIONS}
                  contentClassName='w-[190px]'
                  renderOption={(option) => {
                    const statusCode = getStatusCodeFromLabel(option);

                    return statusCode ? (
                      <ExamReviewProcessStatusBadge status={statusCode} />
                    ) : (
                      option
                    );
                  }}
                >
                  <Button
                    type='button'
                    variant='outline'
                    id={`${dateId}-statuses`}
                    aria-labelledby={`${dateId}-statuses-label`}
                    className='border-input h-9 w-full justify-between bg-transparent px-3 text-sm font-normal hover:bg-transparent'
                  >
                    <span className='truncate'>
                      {selectedStatuses.length > 0
                        ? `관리 상태 ${selectedStatuses.length}개`
                        : '전체'}
                    </span>
                    <ChevronDown className='size-4 opacity-50' />
                  </Button>
                </ExamMultiSelect>
              </div>
              <label className='border-input flex h-9 w-fit cursor-pointer items-center gap-2 rounded-md border bg-white px-3 text-sm font-normal'>
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
          </AdvancedSearchFilters>
        </div>
        <div className='flex flex-wrap justify-end gap-2'>
          <Button
            type='button'
            size='sm'
            className='w-24'
            aria-label='검색 조건 초기화'
            variant='outline'
            onClick={handleSearchOptionReset}
          >
            초기화
          </Button>
          <Button
            type='button'
            size='sm'
            className='w-16'
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
      </div>
    </section>
  );
}
