import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { PaginationBar } from '@/shared/components';
import { Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import {
  ExamConfirmStatusBadge,
  ExamTableEmpty,
  ExamTableEmptyRows,
  ExamTableSkeleton,
} from '@/domains/Reviews/components';
import { useExamReviews } from '@/domains/Reviews/hooks';
import type {
  ExamReview,
  ExamReviewSearchParams,
} from '@/domains/Reviews/types';

// 페이지네이션 설정
const ITEMS_PER_PAGE = 10;

interface ExamReviewTableColumn {
  key: keyof ExamReview;
  label: string;
  width?: string;
  render?: (review: ExamReview) => ReactNode;
}

const EXAM_REVIEW_TABLE_COLUMNS: ExamReviewTableColumn[] = [
  {
    key: 'status',
    label: '확인여부',
    width: '78px',
    render: (review: ExamReview) => (
      <ExamConfirmStatusBadge status={review.status} />
    ),
  },
  { key: 'id', label: 'postId', width: '90px' },
  { key: 'reviewTitle', label: '시험후기명' },
  { key: 'userDisplay', label: '작성자', width: '120px' },
  { key: 'uploadTime', label: '작성일', width: '150px' },
];

interface ExamTableProps {
  data?: ExamReview[];
  onRowSelect?: (review: ExamReview | null) => void;
  refreshKey?: number;
  selectedId?: number | null;
  searchParams?: ExamReviewSearchParams;
  currentPage?: number;
  onPageChange?: (page: number | ((prev: number) => number)) => void;
}

export default function ExamTable({
  data: propData,
  onRowSelect,
  refreshKey,
  selectedId,
  searchParams = {},
  currentPage: propCurrentPage,
  onPageChange: propOnPageChange,
}: ExamTableProps) {
  const lastSelectedIdRef = useRef<number | null>(null);
  const [internalPage, setInternalPage] = useState(1);

  const currentPage = propCurrentPage ?? internalPage;

  const setCurrentPage = useCallback(
    (pageOrUpdater: number | ((prev: number) => number)) => {
      if (propOnPageChange) {
        propOnPageChange(pageOrUpdater);
      } else {
        setInternalPage(pageOrUpdater);
      }
    },
    [propOnPageChange]
  );

  const { data: queryData, isLoading } = useExamReviews({
    page: currentPage,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    keywordAuthor: searchParams.keywordAuthor,
    keywordPost: searchParams.keywordPost,
    sort: searchParams.sort,
    lectureYear: searchParams.lectureYear,
    semester: searchParams.semester,
    examType: searchParams.examType,
    isConfirmed: searchParams.isConfirmed,
    enabled: !propData,
    refreshKey, // refreshKey를 queryKey에 포함시켜 자동 refetch
  });

  const currentPageData = useMemo<ExamReview[]>(
    () => propData ?? queryData?.data ?? [],
    [propData, queryData?.data]
  );
  const hasNext = queryData?.hasNext ?? false;
  const totalPage = queryData?.totalPage;

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

  return (
    <>
      <div className='w-full overflow-hidden rounded-md border'>
        <Table className='w-full table-fixed rounded-lg bg-white shadow'>
          <colgroup>
            {EXAM_REVIEW_TABLE_COLUMNS.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>

          <Table.Header className='z-10 h-[40px] bg-gray-100 shadow-sm [&_tr]:border-b'>
            <Table.Row>
              {EXAM_REVIEW_TABLE_COLUMNS.map((column) => (
                <Table.Head
                  key={column.key}
                  className='relative cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap'
                >
                  {column.label}
                </Table.Head>
              ))}
            </Table.Row>
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
                      className={cn(
                        'hover:cursor-pointer [&_td]:h-[40px]',
                        selectedId === review.id &&
                          'bg-blue-100 hover:bg-blue-100'
                      )}
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
                          className='overflow-hidden text-ellipsis whitespace-nowrap'
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

      <PaginationBar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        hasNext={hasNext}
        totalPage={totalPage}
      />
    </>
  );
}
