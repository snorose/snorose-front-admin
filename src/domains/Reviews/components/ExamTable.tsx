import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Badge, Table } from '@/shared/components/ui';
import { EXAM_REVIEW_PROCESS_STATUS } from '@/shared/constants';
import { cn } from '@/shared/lib';

import {
  ExamConfirmStatusBadge,
  ExamReviewTablePagination,
  ExamTableEmpty,
  ExamTableEmptyRows,
  ExamTableSkeleton,
} from '@/domains/Reviews/components';
import { useExamReviews } from '@/domains/Reviews/hooks';
import type {
  ExamReview,
  ExamReviewProcessStatus,
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

const PROCESS_STATUS_BADGE_CLASS_NAMES: Record<
  ExamReviewProcessStatus,
  string
> = {
  VISIBLE: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  USER_DELETED:
    'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  ADMIN_DELETED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  ADMIN_HIDDEN:
    'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  AUTO_HIDDEN:
    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  SANCTIONED: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  DESANCTIONED:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const getProcessStatusLabel = (status: ExamReviewProcessStatus): string =>
  EXAM_REVIEW_PROCESS_STATUS.find((option) => option.code === status)?.label ??
  status;

const renderBooleanBadge = (
  value: boolean,
  trueLabel: string,
  falseLabel: string
) => (
  <Badge
    variant='outline'
    className={cn(
      'max-w-full truncate',
      value
        ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
        : 'text-gray-500 dark:text-gray-400'
    )}
    title={value ? trueLabel : falseLabel}
  >
    {value ? trueLabel : falseLabel}
  </Badge>
);

const renderReportedStatusBadge = (review: ExamReview) => {
  if (!review.isReported) return null;

  const label = `신고 ${review.reportCount}`;

  return (
    <Badge
      variant='outline'
      className='max-w-full truncate border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
      title={label}
    >
      {label}
    </Badge>
  );
};

const renderProcessStatusBadge = (review: ExamReview) => {
  const statusLabels = review.processStatuses.map(getProcessStatusLabel);
  const reportLabel = review.isReported ? `신고 ${review.reportCount}` : null;
  const label = [reportLabel, ...statusLabels].filter(Boolean).join(', ');

  return (
    <div className='flex flex-wrap gap-1' title={label}>
      {renderReportedStatusBadge(review)}
      {review.processStatuses.map((status) => (
        <Badge
          key={status}
          variant='outline'
          className={PROCESS_STATUS_BADGE_CLASS_NAMES[status]}
        >
          {getProcessStatusLabel(status)}
        </Badge>
      ))}
    </div>
  );
};

const EXAM_REVIEW_TABLE_COLUMNS: ExamReviewTableColumn[] = [
  {
    key: 'status',
    label: '확인여부',
    width: '78px',
    render: (review: ExamReview) => (
      <ExamConfirmStatusBadge
        status={review.status}
        className='justify-center'
      />
    ),
  },
  { key: 'id', label: 'postId', width: '90px' },
  { key: 'reviewTitle', label: '시험후기명', width: '320px' },
  { key: 'userDisplay', label: '작성자', width: '120px' },
  {
    key: 'isDiscussed',
    label: '논의 여부',
    width: '92px',
    render: (review: ExamReview) =>
      renderBooleanBadge(review.isDiscussed, '논의 있음', '논의 없음'),
  },
  {
    key: 'processStatuses',
    label: '관리 상태',
    width: '150px',
    render: renderProcessStatusBadge,
  },
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
    isDiscussed: searchParams.isDiscussed,
    isReported: searchParams.isReported,
    statuses: searchParams.statuses,
    enabled: !propData,
    refreshKey, // refreshKey를 queryKey에 포함시켜 자동 refetch
  });

  const currentPageData = useMemo<ExamReview[]>(
    () => propData ?? queryData?.data ?? [],
    [propData, queryData?.data]
  );
  const hasNext = queryData?.hasNext ?? false;
  const totalPage = queryData?.totalPage;
  const columnCount = EXAM_REVIEW_TABLE_COLUMNS.length;

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
      <div className='w-full overflow-x-auto rounded-md border'>
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
                  className={cn(
                    'relative cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap',
                    column.key === 'status' && 'text-center'
                  )}
                >
                  {column.label}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading ? (
              <ExamTableSkeleton
                itemsPerPage={ITEMS_PER_PAGE}
                columnCount={columnCount}
              />
            ) : currentPageData.length === 0 ? (
              <ExamTableEmpty columnCount={columnCount} />
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
                          className={cn(
                            'overflow-hidden text-ellipsis whitespace-nowrap',
                            column.key === 'status' && 'text-center',
                            column.key === 'processStatuses' &&
                              'whitespace-normal'
                          )}
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
                  columnCount={columnCount}
                />
              </>
            )}
          </Table.Body>
        </Table>
      </div>

      <ExamReviewTablePagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        hasNext={hasNext}
        totalPage={totalPage}
      />
    </>
  );
}
