import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import * as Popover from '@radix-ui/react-popover';
import {
  STATUS_COLOR,
  SEMESTER_LIST,
  EXAM_TYPE_LIST,
} from '@/constants/exam-table-options';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getExamReviews, confirmExamReview } from '@/apis/exam';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import type { ExamReviewApiResponse } from '@/apis/exam';

export interface ExamReview {
  id: number;
  status: string;
  reviewTitle: string;
  courseName: string;
  professor: string;
  semester: string;
  examType: string;
  classNumber: string;
  questionDetail: string;
  uploadTime: string;
  userDisplay: string;
}

// API 응답을 ExamReview로 변환하는 함수
const transformApiResponseToExamReview = (
  apiData: ExamReviewApiResponse
): ExamReview => {
  // title 파싱: "2023-1/기말/프로그래밍입문/이종우/001"
  const titleParts = apiData.title.split('/');
  const semester = titleParts[0] || '';
  const examType = titleParts[1] || '';
  const courseName = titleParts[2] || '';
  const professor = titleParts[3] || '';
  const classNumber = titleParts[4] || '';
  const reviewTitle = apiData.title;

  // createdAt 포맷 변환: "2026-01-06T13:12:37.886Z" -> "2026-01-06 13:12"
  const date = new Date(apiData.createdAt);
  const uploadTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  // isConfirmed를 status로 변환
  const status = apiData.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED';

  return {
    id: apiData.postId,
    status,
    reviewTitle,
    courseName,
    professor,
    semester,
    examType,
    classNumber,
    questionDetail: apiData.questionDetail,
    uploadTime,
    userDisplay: apiData.userDisplay,
  };
};

interface ExamTableProps {
  data?: ExamReview[];
  onRowSelect?: (review: ExamReview | null) => void;
  refreshKey?: number;
  selectedId?: number | null;
}

// 상태 점 컴포넌트
const StatusDot = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    const statusColor = STATUS_COLOR.find((color) => color.code === status);
    return statusColor?.color || 'bg-white';
  };

  return (
    <div className='flex items-center justify-center'>
      <div
        className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
        title={status}
      />
    </div>
  );
};

// 다중 선택 Select 컴포넌트
interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: string[];
  contentClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  showStatusDot?: boolean;
  children: React.ReactNode;
}

const MultiSelect = ({
  value,
  onValueChange,
  options,
  contentClassName = '',
  side = 'bottom',
  align = 'start',
  showStatusDot = false,
  children,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  // 드롭다운이 열려있을 때 body 스크롤 막기
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  const allSelected =
    options.length > 0 && options.every((opt) => value.includes(opt));
  const handleSelectAll = () => {
    if (allSelected) {
      onValueChange([]);
    } else {
      onValueChange([...options]);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={4}
          className={`text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[200px] min-w-[8rem] origin-[var(--radix-select-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-blue-50 shadow-md ${contentClassName}`}
        >
          <div className='p-1'>
            {/* 전체 선택/해제 체크박스 */}
            <div
              className='relative mb-1 flex w-full cursor-default items-center rounded-sm border-b border-gray-200 px-1.5 py-1.5 text-xs outline-none select-none hover:bg-blue-100/50'
              onClick={handleSelectAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectAll();
                }
              }}
              role='option'
              tabIndex={0}
            >
              <input
                type='checkbox'
                checked={allSelected}
                onChange={() => {}}
                className={`relative mr-2 h-3 w-3 shrink-0 cursor-pointer appearance-none rounded border-2 ${
                  allSelected
                    ? 'border-blue-500 bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[8px] checked:before:text-white checked:before:content-["✓"]'
                    : 'border-gray-300 bg-transparent'
                }`}
                tabIndex={-1}
              />
              <span className='flex-1 font-medium'>전체 선택</span>
            </div>
            {options.map((option) => {
              const isSelected = value.includes(option);
              const statusOption = showStatusDot
                ? STATUS_COLOR.find((s) => s.name === option)
                : null;
              return (
                <div
                  key={option}
                  className='relative flex w-full cursor-default items-center rounded-sm px-1.5 py-1.5 text-xs outline-none select-none hover:bg-blue-100/50'
                  onClick={() => handleToggle(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(option);
                    }
                  }}
                  role='option'
                  aria-selected={isSelected}
                  tabIndex={0}
                >
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => {}}
                    className={`relative mr-2 h-3 w-3 shrink-0 cursor-pointer appearance-none rounded border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[8px] checked:before:text-white checked:before:content-["✓"]'
                        : 'border-gray-300 bg-transparent'
                    }`}
                    tabIndex={-1}
                  />
                  <span className='flex-1'>{option}</span>
                  {showStatusDot && statusOption && (
                    <div
                      className={`ml-2 h-2 w-2 shrink-0 rounded-full ${statusOption.color}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default function ExamTable({
  data: propData,
  onRowSelect,
  refreshKey,
  selectedId,
}: ExamTableProps) {
  // API 데이터 상태 관리
  const [apiData, setApiData] = useState<ExamReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const lastSelectedIdRef = useRef<number | null>(null);

  // 페이지네이션 설정
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // 검색 및 필터 상태
  const [searchKeyword] = useState<string>('');
  const [lectureYear] = useState<number | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<
    string | undefined
  >();
  const [selectedExamType, setSelectedExamType] = useState<
    string | undefined
  >();

  // 상태 선택 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<{
    [key: number]: string;
  }>({});

  // Select 열림 상태 관리
  const [openStatusSelect, setOpenStatusSelect] = useState<{
    [key: number]: boolean;
  }>({});
  // 상태 리스트 생성
  const STATUS_LIST = STATUS_COLOR.map((status) => status.name);

  // 헤더 필터 선택 상태 관리 (다중 선택)
  const [headerFilters, setHeaderFilters] = useState<{
    status: string[];
    semester: string[];
    examType: string[];
  }>({
    status: STATUS_LIST,
    semester: SEMESTER_LIST,
    examType: EXAM_TYPE_LIST,
  });

  // propData가 제공되면 사용, 없으면 API 데이터 사용
  const data = propData || apiData;

  // 페이지네이션 계산
  // API 기반이므로 현재 페이지 데이터는 이미 API에서 받아온 데이터
  const currentPageData = data;

  // 상태 선택 함수
  const handleStatusSelect = async (
    reviewId: number,
    statusCode: string,
    statusName: string
  ) => {
    // 상태 코드에 따라 isConfirmed 값 결정
    const isConfirmed = statusCode === 'CONFIRMED';

    try {
      // API 호출
      const response = await confirmExamReview(reviewId, { isConfirmed });

      if (response.isSuccess) {
        // 성공 시 로컬 상태 업데이트
        setSelectedStatus((prev) => ({
          ...prev,
          [reviewId]: statusCode,
        }));

        // API 데이터도 업데이트
        setApiData((prev) =>
          prev.map((review) =>
            review.id === reviewId ? { ...review, status: statusCode } : review
          )
        );

        toast.success(
          `시험 후기가 ${statusName === '확인완료' ? '확인완료' : '미확인 족보'}로 변경되었습니다.`
        );
      } else {
        toast.error(response.message || '시험 후기 상태 변경에 실패했습니다.');
      }
    } catch (error: unknown) {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '시험 후기 상태 변경에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  // 헤더 필터 다중 선택 함수
  const handleHeaderFilterSelect = (
    filterType: 'status' | 'semester' | 'examType' | 'manager',
    value: string[]
  ) => {
    setHeaderFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    console.log(`Filter Type: ${filterType}, Selected Values:`, value);

    // 필터 변경 시 API 파라미터 업데이트
    if (filterType === 'semester' && value.length === 1) {
      setSelectedSemester(value[0]);
      setCurrentPage(1); // 필터 변경 시 첫 페이지로
    } else if (filterType === 'semester' && value.length === 0) {
      setSelectedSemester(undefined);
      setCurrentPage(1);
    }

    if (filterType === 'examType' && value.length === 1) {
      // "중간고사" -> "MIDTERM", "기말고사" -> "FINAL" 변환 필요할 수 있음
      setSelectedExamType(value[0]);
      setCurrentPage(1);
    } else if (filterType === 'examType' && value.length === 0) {
      setSelectedExamType(undefined);
      setCurrentPage(1);
    }
  };

  // API 데이터 로드 함수
  const loadExamReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getExamReviews({
        page: currentPage - 1, // API는 0부터 시작
        keyword: searchKeyword || undefined,
        lectureYear,
        semester: selectedSemester,
        examType: selectedExamType,
      });

      if (response.isSuccess && response.result) {
        const transformedData = response.result.data.map(
          transformApiResponseToExamReview
        );
        setApiData(transformedData);
        setHasNext(response.result.hasNext);
      } else {
        toast.error(
          response.message || '시험 후기 목록을 불러오는데 실패했습니다.'
        );
        setApiData([]);
      }
    } catch (error: unknown) {
      const errorMessage =
        (isAxiosError(error) && error.response?.data?.message) ||
        '시험 후기 목록을 불러오는데 실패했습니다.';
      toast.error(errorMessage);
      setApiData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    searchKeyword,
    lectureYear,
    selectedSemester,
    selectedExamType,
  ]);

  // 초기 로드 및 필터/페이지 변경 시 재로드
  useEffect(() => {
    loadExamReviews();
  }, [loadExamReviews]);

  // refreshKey가 변경되면 데이터 다시 로드
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      loadExamReviews();
    }
  }, [refreshKey, loadExamReviews]);

  // 선택된 행이 있으면 업데이트된 데이터로 자동 선택 (무한 루프 방지를 위해 별도 useEffect로 분리)
  useEffect(() => {
    if (selectedId && onRowSelect && apiData.length > 0) {
      // 이미 같은 ID를 선택했으면 중복 호출 방지
      if (lastSelectedIdRef.current === selectedId) {
        return;
      }

      const updatedReview = apiData.find(
        (review: ExamReview) => review.id === selectedId
      );
      if (updatedReview) {
        lastSelectedIdRef.current = selectedId;
        onRowSelect(updatedReview);
      }
    } else if (!selectedId) {
      // 선택 해제 시 ref 초기화
      lastSelectedIdRef.current = null;
    }
  }, [selectedId, apiData, onRowSelect]);

  // 선택된 필터 상태 디버깅
  useEffect(() => {
    console.log('Header Filters:', headerFilters);
  }, [headerFilters]);

  return (
    <div className='no-scrollbar scroll-hidden overflow-x-scroll'>
      <Table className='table-fixed rounded-lg bg-white shadow'>
        {/* Table Header */}
        <TableHeader className='z-10 bg-gray-100 shadow-sm [&_tr]:border-b'>
          <TableRow className='hover:bg-gray-100'>
            <TableHead className='w-[70px] text-center'>id</TableHead>
            <MultiSelect
              value={headerFilters.status}
              onValueChange={(value) =>
                handleHeaderFilterSelect('status', value)
              }
              options={STATUS_LIST}
              contentClassName='w-32 max-h-[300px]'
              side='bottom'
              align='start'
              showStatusDot={true}
            >
              <TableHead className='relative w-[50px] cursor-pointer overflow-hidden text-center hover:bg-gray-200'>
                상태 ▼
              </TableHead>
            </MultiSelect>
            <TableHead className='w-[200px]'>시험후기명</TableHead>
            <TableHead className='w-[120px]'>강의명</TableHead>
            <TableHead className='w-[60px]'>교수</TableHead>
            <MultiSelect
              value={headerFilters.semester}
              onValueChange={(value) =>
                handleHeaderFilterSelect('semester', value)
              }
              options={SEMESTER_LIST}
              contentClassName='w-32'
              side='bottom'
              align='start'
            >
              <TableHead className='relative w-[84px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                수강학기 ▼
              </TableHead>
            </MultiSelect>
            <MultiSelect
              value={headerFilters.examType}
              onValueChange={(value) =>
                handleHeaderFilterSelect('examType', value)
              }
              options={EXAM_TYPE_LIST}
              contentClassName='w-28'
              side='bottom'
              align='start'
            >
              <TableHead className='relative w-[60px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                시험종류 ▼
              </TableHead>
            </MultiSelect>
            <TableHead className='w-[60px]'>분반</TableHead>
            <TableHead className='w-[150px]'>시험 유형 및 문항수</TableHead>
            <TableHead className='w-[110px]'>업로드 시간</TableHead>
            <TableHead className='w-[80px]'>게시자</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {isLoading ? (
            // 로딩 중일 때 스켈레톤 표시
            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className='[&_td]:h-[24px]'>
                <TableCell className='w-[70px] text-center'>
                  <Skeleton className='mx-auto h-4 w-8' />
                </TableCell>
                <TableCell className='w-[50px]'>
                  <Skeleton className='mx-auto h-2 w-2 rounded-full' />
                </TableCell>
                <TableCell className='w-[200px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[120px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[60px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[84px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[60px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[60px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[150px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[110px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell className='w-[80px]'>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <>
              {currentPageData.map((review) => {
                // Select가 열린 행이 있는지 확인
                const hasOpenSelect =
                  Object.values(openStatusSelect).some(Boolean);
                // Select가 열린 행이 있으면 그 행만 active, 없으면 selectedId와 일치하는 행만 active
                const isRowActive = hasOpenSelect
                  ? openStatusSelect[review.id]
                  : selectedId === review.id;
                return (
                  <TableRow
                    key={review.id}
                    className={`hover:cursor-pointer [&_td]:h-[24px] ${
                      isRowActive ? 'bg-blue-100 hover:bg-blue-100' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 토글 방식: 선택된 행을 다시 클릭하면 해제, 다른 행 클릭하면 선택
                      if (selectedId === review.id) {
                        onRowSelect?.(null);
                      } else {
                        onRowSelect?.(review);
                      }
                    }}
                  >
                    <TableCell className='w-[70px] text-center text-gray-600'>
                      {review.id}
                    </TableCell>
                    <TableCell className='relative w-[50px] cursor-pointer p-0 text-center'>
                      <Select
                        value={selectedStatus[review.id] || review.status}
                        onValueChange={async (value) => {
                          const statusOption = STATUS_COLOR.find(
                            (s) => s.code === value
                          );
                          if (statusOption) {
                            await handleStatusSelect(
                              review.id,
                              statusOption.code,
                              statusOption.name
                            );
                          }
                          setOpenStatusSelect((prev) => ({
                            ...prev,
                            [review.id]: false,
                          }));
                          // 포커스 제거
                          setTimeout(() => {
                            const activeElement =
                              document.activeElement as HTMLElement;
                            if (activeElement) {
                              activeElement.blur();
                            }
                          }, 0);
                        }}
                        open={openStatusSelect[review.id] || false}
                        onOpenChange={(open) => {
                          setOpenStatusSelect((prev) => ({
                            ...prev,
                            [review.id]: open,
                          }));
                          if (!open) {
                            // 닫힐 때 포커스 제거
                            setTimeout(() => {
                              const activeElement =
                                document.activeElement as HTMLElement;
                              if (activeElement) {
                                activeElement.blur();
                              }
                            }, 0);
                          }
                        }}
                      >
                        <SelectTrigger className='!absolute !inset-0 !flex !h-full !w-full !items-center !justify-center !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-transparent focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!outline-none [&>svg]:!hidden'>
                          <SelectValue className='!flex !items-center !justify-center'>
                            <StatusDot
                              status={
                                selectedStatus[review.id] || review.status
                              }
                            />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                          align='start'
                          className='max-h-[200px] overflow-y-auto bg-blue-50 text-[12px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
                        >
                          {STATUS_COLOR.map((statusOption) => (
                            <SelectItem
                              key={statusOption.id}
                              value={statusOption.code}
                              className='text-[12px] font-medium'
                            >
                              <div className='flex items-center gap-2'>
                                <div
                                  className={`h-2 w-2 shrink-0 rounded-full ${statusOption.color}`}
                                />
                                <span>{statusOption.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className='w-[200px] overflow-hidden'>
                      <div
                        className='w-full truncate'
                        title={review.reviewTitle}
                      >
                        {review.reviewTitle}
                      </div>
                    </TableCell>
                    <TableCell className='w-[120px] overflow-hidden'>
                      <div
                        className='w-full truncate'
                        title={review.courseName}
                      >
                        {review.courseName}
                      </div>
                    </TableCell>
                    <TableCell className='w-[60px] overflow-hidden'>
                      <div className='w-full truncate' title={review.professor}>
                        {review.professor}
                      </div>
                    </TableCell>
                    <TableCell className='w-[84px] overflow-hidden'>
                      <div className='w-full truncate' title={review.semester}>
                        {review.semester}
                      </div>
                    </TableCell>
                    <TableCell className='w-[60px] overflow-hidden'>
                      <div className='w-full truncate' title={review.examType}>
                        {review.examType}
                      </div>
                    </TableCell>
                    <TableCell className='w-[60px] overflow-hidden'>
                      <div
                        className='w-full truncate'
                        title={review.classNumber}
                      >
                        {review.classNumber}
                      </div>
                    </TableCell>
                    <TableCell className='w-[150px] overflow-hidden'>
                      <div
                        className='w-full truncate'
                        title={review.questionDetail}
                      >
                        {review.questionDetail}
                      </div>
                    </TableCell>
                    <TableCell className='w-[110px] overflow-hidden text-gray-600'>
                      <div
                        className='w-full truncate'
                        title={review.uploadTime}
                      >
                        {review.uploadTime}
                      </div>
                    </TableCell>
                    <TableCell className='w-[80px] overflow-hidden'>
                      <div
                        className='w-full truncate'
                        title={review.userDisplay}
                      >
                        {review.userDisplay}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* 빈 행 추가하여 항상 10개 행 표시 */}
              {Array.from({
                length: ITEMS_PER_PAGE - currentPageData.length,
              }).map((_, index) => (
                <TableRow key={`empty-${index}`} className='[&_td]:h-[24px]'>
                  <TableCell className='w-[70px] text-center text-gray-600'>
                    &nbsp;
                  </TableCell>
                  <TableCell className='w-[50px]'>&nbsp;</TableCell>
                  <TableCell className='w-[200px]'>&nbsp;</TableCell>
                  <TableCell className='w-[120px]'>&nbsp;</TableCell>
                  <TableCell className='w-[60px]'>&nbsp;</TableCell>
                  <TableCell className='w-[84px]'>&nbsp;</TableCell>
                  <TableCell className='w-[60px]'>&nbsp;</TableCell>
                  <TableCell className='w-[60px]'>&nbsp;</TableCell>
                  <TableCell className='w-[150px]'>&nbsp;</TableCell>
                  <TableCell className='w-[110px]'>&nbsp;</TableCell>
                  <TableCell className='w-[80px]'>&nbsp;</TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>

      {/* 페이지네이션 */}
      <div className='relative flex flex-col items-center gap-3 px-4 py-4'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className='rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
          >
            이전
          </button>
          <div className='flex items-center gap-1'>
            {(() => {
              const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
              return Array.from({ length: 10 }, (_, i) => startPage + i).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-3 py-1 text-xs ${
                      currentPage === page
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {page}
                  </button>
                )
              );
            })()}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNext}
            className='rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
