import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
} from '@/shared/components/ui';
import { STATUS_COLOR } from '@/shared/constants';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useExamReviews, useConfirmExamReview } from '@/domains/Reviews/hooks';
import {
  ExamTableSkeleton,
  ExamTableEmptyRows,
  ExamTableEmpty,
} from './ExamTableFallback';
import ExamTablePagination from './ExamTablePagination';
import { ExamStatusDot } from '@/domains/Reviews/components';
import type { ExamReview } from '@/domains/Reviews/types';

// 페이지네이션 설정
const ITEMS_PER_PAGE = 10;

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

export default function ExamTable({
  data: propData,
  onRowSelect,
  refreshKey,
  selectedId,
  searchParams = {},
  currentPage: propCurrentPage,
  onPageChange,
}: ExamTableProps) {
  const lastSelectedIdRef = useRef<number | null>(null);

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

  // 상태 선택 상태 관리 (로컬 UI 상태)
  const [selectedStatus, setSelectedStatus] = useState<{
    [key: number]: string;
  }>({});

  // Select 열림 상태 관리
  const [openStatusSelect, setOpenStatusSelect] = useState<{
    [key: number]: boolean;
  }>({});

  const { data: queryData, isLoading } = useExamReviews({
    page: currentPage,
    keyword: searchParams.keyword,
    lectureYear: searchParams.lectureYear,
    semester: searchParams.semester,
    examType: searchParams.examType,
    enabled: !propData,
    refreshKey, // refreshKey를 queryKey에 포함시켜 자동 refetch
  });

  const confirmMutation = useConfirmExamReview();

  // propData가 제공되면 사용, 없으면 API 데이터 사용
  const currentPageData = useMemo(
    () => propData || queryData?.data || [],
    [propData, queryData?.data]
  );

  const hasNext = queryData?.hasNext || false;

  // 선택된 행이 있으면 업데이트된 데이터로 자동 선택
  useEffect(() => {
    if (selectedId && onRowSelect && currentPageData.length > 0) {
      if (lastSelectedIdRef.current === selectedId) {
        return;
      }

      const updatedReview = currentPageData.find(
        (review: ExamReview) => review.id === selectedId
      );
      if (updatedReview) {
        lastSelectedIdRef.current = selectedId;
        onRowSelect(updatedReview);
      }
    } else if (!selectedId) {
      lastSelectedIdRef.current = null;
    }
  }, [selectedId, currentPageData, onRowSelect]);

  // 상태 선택 함수
  const handleStatusSelect = async (reviewId: number, statusCode: string) => {
    // 상태 코드에 따라 isConfirmed 값 결정
    const isConfirmed = statusCode === 'CONFIRMED';

    // 현재 상태 저장 (롤백용)
    const previousStatus =
      selectedStatus[reviewId] ||
      currentPageData.find((r) => r.id === reviewId)?.status;

    // 로컬 상태 먼저 업데이트 (낙관적 업데이트)
    setSelectedStatus((prev) => ({
      ...prev,
      [reviewId]: statusCode,
    }));

    // Mutation 실행
    confirmMutation.mutate(
      {
        reviewId,
        isConfirmed,
      },
      {
        onSuccess: () => {
          // 성공 시 선택된 review가 현재 변경된 review이면 상태 업데이트
          if (selectedId === reviewId && onRowSelect) {
            const updatedReview = currentPageData.find(
              (r) => r.id === reviewId
            );
            if (updatedReview) {
              // 상태가 업데이트된 review 객체 생성
              const reviewWithUpdatedStatus: ExamReview = {
                ...updatedReview,
                status: statusCode,
              };
              onRowSelect(reviewWithUpdatedStatus);
            }
          }
        },
        onError: () => {
          // 실패 시 롤백
          if (previousStatus) {
            setSelectedStatus((prev) => ({
              ...prev,
              [reviewId]: previousStatus,
            }));
          } else {
            setSelectedStatus((prev) => {
              const newState = { ...prev };
              delete newState[reviewId];
              return newState;
            });
          }
        },
      }
    );
  };

  const isEmpty = !isLoading && currentPageData.length === 0;

  return (
    <>
      <div className='overflow-hidden rounded-md border'>
        <Table
          className={`${isEmpty ? 'w-full' : 'table-fixed'} rounded-lg bg-white shadow`}
        >
          {/* Table Header */}
          <TableHeader className='z-10 bg-gray-100 shadow-sm [&_tr]:border-b'>
            <TableRow className='hover:bg-gray-100'>
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
              <TableHead className='w-[110px]'>업로드 시간</TableHead>
              <TableHead className='w-[80px]'>게시자</TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {isLoading ? (
              <ExamTableSkeleton itemsPerPage={ITEMS_PER_PAGE} />
            ) : currentPageData.length === 0 ? (
              <ExamTableEmpty />
            ) : (
              <>
                {currentPageData.map((review) => {
                  const hasOpenSelect =
                    Object.values(openStatusSelect).some(Boolean);
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
                        if (selectedId === review.id) {
                          onRowSelect?.(null);
                        } else {
                          onRowSelect?.(review);
                        }
                      }}
                    >
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
                                statusOption.code
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
                            if (open) {
                              // Select가 열릴 때 해당 행 선택
                              if (selectedId !== review.id && onRowSelect) {
                                onRowSelect(review);
                              }
                            } else {
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
                          <Select.Trigger className='!absolute !inset-0 !flex !h-full !w-full !items-center !justify-center !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-transparent focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!outline-none [&>svg]:!hidden'>
                            <Select.Value className='!flex !items-center !justify-center'>
                              <ExamStatusDot
                                status={
                                  selectedStatus[review.id] || review.status
                                }
                              />
                            </Select.Value>
                          </Select.Trigger>
                          <Select.Content
                            align='start'
                            className='max-h-[200px] overflow-y-auto bg-blue-50 text-[12px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
                          >
                            {STATUS_COLOR.map((statusOption) => (
                              <Select.Item
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
                              </Select.Item>
                            ))}
                          </Select.Content>
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
                        <div
                          className='w-full truncate'
                          title={review.professor}
                        >
                          {review.professor}
                        </div>
                      </TableCell>
                      <TableCell className='w-[84px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.semester}
                        >
                          {review.semester}
                        </div>
                      </TableCell>
                      <TableCell className='w-[60px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.examType}
                        >
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
                <ExamTableEmptyRows
                  count={ITEMS_PER_PAGE - currentPageData.length}
                />
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <ExamTablePagination
        currentPage={currentPage}
        hasNext={hasNext}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
