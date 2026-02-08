import { useEffect, useMemo, useRef, useState } from 'react';

import { Pagination, Table } from '@/shared/components/ui';

import {
  ExamConfirmStatusBadge,
  ExamTableEmpty,
  ExamTableEmptyRows,
  ExamTableSkeleton,
} from '@/domains/Reviews/components';
import { useExamReviews } from '@/domains/Reviews/hooks';
import type { ExamReview } from '@/domains/Reviews/types';

// 페이지네이션 설정
const ITEMS_PER_PAGE = 10;

const EXAM_REVIEW_TABLE_COLUMNS = [
  {
    key: 'status',
    label: '확인여부',
    width: '50px',
    render: (review: ExamReview) => (
      <ExamConfirmStatusBadge status={review.status} />
    ),
  },
  { key: 'reviewTitle', label: '시험후기명', width: '200px' },
  { key: 'courseName', label: '강의명', width: '120px' },
  { key: 'professor', label: '교수명', width: '60px' },
  { key: 'semester', label: '수강학기', width: '60px' },
  { key: 'examType', label: '시험종류', width: '60px' },
  { key: 'classNumber', label: '분반', width: '60px' },
  { key: 'uploadTime', label: '업로드 시간', width: '110px' },
  { key: 'userDisplay', label: '게시자', width: '80px' },
];

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
          <Table.Header className='z-10 h-[40px] bg-gray-100 shadow-sm [&_tr]:border-b'>
            {EXAM_REVIEW_TABLE_COLUMNS.map((column) => (
              <Table.Head
                key={column.key}
                style={{ width: column.width }}
                className='relative cursor-pointer overflow-hidden'
              >
                {column.label}
              </Table.Head>
            ))}
          </Table.Header>

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
                      className='hover:cursor-pointer [&_td]:h-[40px]'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedId === review.id) {
                          onRowSelect?.(null);
                        } else {
                          onRowSelect?.(review);
                        }
                      }}
                    >
                      {EXAM_REVIEW_TABLE_COLUMNS.map((column) => (
                        <Table.Cell
                          key={column.key}
                          style={{ width: column.width }}
                          className='truncate overflow-hidden'
                        >
                          {column.render
                            ? column.render(review)
                            : (review[
                                column.key as keyof ExamReview
                              ] as string)}
                        </Table.Cell>
                      ))}
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

      <Pagination className='py-4'>
        <Pagination.Content className='flex flex-wrap items-center justify-center gap-1'>
          <Pagination.Item>
            <Pagination.Previous
              href='#'
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage((p) => p - 1);
              }}
              className={
                currentPage === 1 ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </Pagination.Item>
          {(() => {
            const inBlockMode = currentPage > 10;
            const startPage = inBlockMode
              ? Math.floor((currentPage - 1) / 10) * 10 + 1
              : 1;
            const endPage = hasNext
              ? inBlockMode
                ? startPage + 9
                : 10
              : currentPage;
            const pageNumbers = Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i
            );
            return pageNumbers.map((page) => (
              <Pagination.Item key={page}>
                <Pagination.Link
                  isActive={currentPage === page}
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  className={
                    currentPage === page ? 'cursor-default' : undefined
                  }
                >
                  {page}
                </Pagination.Link>
              </Pagination.Item>
            ));
          })()}
          <Pagination.Item>
            <Pagination.Next
              href='#'
              onClick={(e) => {
                e.preventDefault();
                if (hasNext) setCurrentPage((p) => p + 1);
              }}
              className={
                !hasNext ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </>
  );
}
