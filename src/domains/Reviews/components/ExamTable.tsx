import { useEffect, useMemo, useRef, useState } from 'react';

import { Table } from '@/shared/components/ui';

import { ExamConfirmStatusBadge } from '@/domains/Reviews/components';
import { useExamReviews } from '@/domains/Reviews/hooks';
import type { ExamReview } from '@/domains/Reviews/types';

import {
  ExamTableEmpty,
  ExamTableEmptyRows,
  ExamTableSkeleton,
} from './ExamTableFallback';
import ExamTablePagination from './ExamTablePagination';

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

  const { data: queryData, isLoading } = useExamReviews({
    page: currentPage,
    keyword: searchParams.keyword,
    lectureYear: searchParams.lectureYear,
    semester: searchParams.semester,
    examType: searchParams.examType,
    enabled: !propData,
    refreshKey, // refreshKey를 queryKey에 포함시켜 자동 refetch
  });

  // propData가 제공되면 사용, 없으면 API 데이터 사용
  const currentPageData = useMemo<ExamReview[]>(
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

  const isEmpty = !isLoading && currentPageData.length === 0;

  return (
    <>
      <div className='overflow-hidden rounded-md border'>
        <Table
          className={`${isEmpty ? 'w-full' : 'table-fixed'} rounded-lg bg-white shadow`}
        >
          {/* Table Header */}
          <Table.Header className='z-10 bg-gray-100 shadow-sm [&_tr]:border-b'>
            <Table.Row className='hover:bg-gray-100'>
              <Table.Head className='relative w-[50px] cursor-pointer overflow-hidden text-center hover:bg-gray-200'>
                확인여부
              </Table.Head>
              <Table.Head className='w-[200px]'>시험후기명</Table.Head>
              <Table.Head className='w-[120px]'>강의명</Table.Head>
              <Table.Head className='w-[60px]'>교수</Table.Head>
              <Table.Head className='relative w-[84px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                수강학기
              </Table.Head>
              <Table.Head className='relative w-[60px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                시험종류
              </Table.Head>
              <Table.Head className='w-[60px]'>분반</Table.Head>
              <Table.Head className='w-[110px]'>업로드 시간</Table.Head>
              <Table.Head className='w-[80px]'>게시자</Table.Head>
            </Table.Row>
          </Table.Header>

          {/* Table Body */}
          <Table.Body>
            {isLoading ? (
              <ExamTableSkeleton itemsPerPage={ITEMS_PER_PAGE} />
            ) : currentPageData.length === 0 ? (
              <ExamTableEmpty />
            ) : (
              <>
                {currentPageData.map((review: ExamReview) => {
                  return (
                    <Table.Row
                      key={review.id}
                      className='hover:cursor-pointer [&_td]:h-[24px]'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedId === review.id) {
                          onRowSelect?.(null);
                        } else {
                          onRowSelect?.(review);
                        }
                      }}
                    >
                      <Table.Cell className='relative w-[50px] cursor-pointer p-0 text-center'>
                        <ExamConfirmStatusBadge status={review.status} />
                      </Table.Cell>
                      <Table.Cell className='w-[200px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.reviewTitle}
                        >
                          {review.reviewTitle}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[120px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.courseName}
                        >
                          {review.courseName}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[60px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.professor}
                        >
                          {review.professor}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[84px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.semester}
                        >
                          {review.semester}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[60px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.examType}
                        >
                          {review.examType}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[60px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.classNumber}
                        >
                          {review.classNumber}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[110px] overflow-hidden text-gray-600'>
                        <div
                          className='w-full truncate'
                          title={review.uploadTime}
                        >
                          {review.uploadTime}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-[80px] overflow-hidden'>
                        <div
                          className='w-full truncate'
                          title={review.userDisplay}
                        >
                          {review.userDisplay}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
                <ExamTableEmptyRows
                  count={ITEMS_PER_PAGE - currentPageData.length}
                />
              </>
            )}
          </Table.Body>
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
