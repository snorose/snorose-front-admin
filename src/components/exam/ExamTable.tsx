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
import { STATUS_COLOR } from '@/constants/exam-table-options';
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
  searchParams?: {
    keyword?: string;
    lectureYear?: number;
    semester?: string;
    examType?: string;
  };
  currentPage?: number;
  onPageChange?: (page: number) => void;
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

export default function ExamTable({
  data: propData,
  onRowSelect,
  refreshKey,
  selectedId,
  searchParams = {},
  currentPage: propCurrentPage,
  onPageChange,
}: ExamTableProps) {
  // API 데이터 상태 관리
  const [apiData, setApiData] = useState<ExamReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const lastSelectedIdRef = useRef<number | null>(null);
  // 이전 쿼리 파라미터 추적 (스켈레톤 표시 여부 판단용)
  const previousQueryRef = useRef<{
    page: number;
    keyword?: string;
    lectureYear?: number;
    semester?: string;
    examType?: string;
  } | null>(null);

  // 페이지네이션 설정
  const ITEMS_PER_PAGE = 10;
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  // prop으로 전달된 currentPage가 있으면 사용, 없으면 내부 state 사용
  const currentPage = propCurrentPage ?? internalCurrentPage;

  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    const newPage = typeof page === 'function' ? page(currentPage) : page;
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  // 상태 선택 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<{
    [key: number]: string;
  }>({});

  // Select 열림 상태 관리
  const [openStatusSelect, setOpenStatusSelect] = useState<{
    [key: number]: boolean;
  }>({});

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

  // 쿼리가 변경되었는지 확인하는 함수
  const hasQueryChanged = (
    prev: typeof previousQueryRef.current,
    current: {
      page: number;
      keyword?: string;
      lectureYear?: number;
      semester?: string;
      examType?: string;
    }
  ): boolean => {
    if (!prev) return true; // 첫 로드일 때는 변경된 것으로 간주

    return (
      prev.page !== current.page ||
      prev.keyword !== current.keyword ||
      prev.lectureYear !== current.lectureYear ||
      prev.semester !== current.semester ||
      prev.examType !== current.examType
    );
  };

  // API 데이터 로드 함수
  const loadExamReviews = useCallback(async () => {
    const currentQuery = {
      page: currentPage,
      keyword: searchParams.keyword,
      lectureYear: searchParams.lectureYear,
      semester: searchParams.semester,
      examType: searchParams.examType,
    };

    // 쿼리가 변경되었을 때만 스켈레톤 표시
    const queryChanged = hasQueryChanged(
      previousQueryRef.current,
      currentQuery
    );
    if (queryChanged) {
      setIsLoading(true);
    }

    try {
      const response = await getExamReviews({
        page: currentPage - 1, // API는 0부터 시작
        keyword: searchParams.keyword,
        lectureYear: searchParams.lectureYear,
        semester: searchParams.semester,
        examType: searchParams.examType,
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
      // 쿼리가 변경되었을 때만 로딩 상태 해제
      if (queryChanged) {
        setIsLoading(false);
      }
      // 현재 쿼리를 이전 쿼리로 저장
      previousQueryRef.current = currentQuery;
    }
  }, [currentPage, searchParams]);

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

  const isEmpty = !isLoading && currentPageData.length === 0;

  return (
    <div
      className={`no-scrollbar scroll-hidden ${
        isEmpty ? 'overflow-hidden' : 'overflow-x-scroll'
      }`}
    >
      <Table
        className={`${isEmpty ? 'w-full' : 'table-fixed'} rounded-lg bg-white shadow`}
      >
        {/* Table Header */}
        <TableHeader className='z-10 bg-gray-100 shadow-sm [&_tr]:border-b'>
          <TableRow className='hover:bg-gray-100'>
            <TableHead className='w-[70px] text-center'>id</TableHead>
            <TableHead className='relative w-[50px] cursor-pointer overflow-hidden text-center hover:bg-gray-200'>
              상태
            </TableHead>
            <TableHead className='w-[200px]'>시험후기명</TableHead>
            <TableHead className='w-[120px]'>강의명</TableHead>
            <TableHead className='w-[60px]'>교수</TableHead>
            <TableHead className='relative w-[84px] cursor-pointer overflow-hidden hover:bg-gray-200'>
              수강학기
            </TableHead>
            <TableHead className='relative w-[60px] cursor-pointer overflow-hidden hover:bg-gray-200'>
              시험종류
            </TableHead>
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
          ) : currentPageData.length === 0 ? (
            // 데이터가 없을 때 - 10개 행 높이를 모두 차지하며 중앙 정렬
            <TableRow>
              <TableCell colSpan={11} className='h-[240px] p-0 text-gray-500'>
                <div className='flex h-full items-center justify-center'>
                  해당하는 데이터가 없습니다
                </div>
              </TableCell>
            </TableRow>
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
