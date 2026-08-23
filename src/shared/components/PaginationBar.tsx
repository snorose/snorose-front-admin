import { Pagination } from '@/shared/components/ui';

interface PaginationBarProps {
  /** 1부터 시작하는 현재 페이지 */
  currentPage: number;
  /** 1부터 시작하는 페이지 번호를 전달한다. */
  onPageChange: (page: number) => void;
  totalPage: number;
  /** 한 번에 표시할 페이지 번호 개수. 기본값은 10이다. */
  pageBlockSize?: number;
}

const DEFAULT_PAGE_BLOCK_SIZE = 10;

function getBlockStartPage(page: number, pageBlockSize: number) {
  return Math.floor((page - 1) / pageBlockSize) * pageBlockSize + 1;
}

export function PaginationBar({
  currentPage,
  onPageChange,
  totalPage,
  pageBlockSize = DEFAULT_PAGE_BLOCK_SIZE,
}: PaginationBarProps) {
  const blockStart = getBlockStartPage(currentPage, pageBlockSize);
  const previousPage = Math.max(1, blockStart - pageBlockSize);
  const nextPage = blockStart + pageBlockSize;
  const lastPage = Math.max(1, totalPage);
  const canGoPrevious = blockStart > 1;
  const canGoNext = blockStart + pageBlockSize - 1 < lastPage;
  const startPage = blockStart;
  const endPage = Math.min(startPage + pageBlockSize - 1, lastPage);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <Pagination className='py-2'>
      <Pagination.Content className='flex flex-wrap items-center justify-center gap-1'>
        <Pagination.Item>
          <Pagination.Previous
            href='#'
            aria-label='이전 페이지 묶음'
            aria-disabled={!canGoPrevious}
            tabIndex={canGoPrevious ? undefined : -1}
            onClick={(e) => {
              e.preventDefault();
              if (canGoPrevious) onPageChange(previousPage);
            }}
            className={
              !canGoPrevious ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </Pagination.Item>
        {pageNumbers.map((page) => (
          <Pagination.Item key={page}>
            <Pagination.Link
              isActive={currentPage === page}
              href='#'
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
              className={currentPage === page ? 'cursor-default' : undefined}
            >
              {page}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            href='#'
            aria-label='다음 페이지 묶음'
            aria-disabled={!canGoNext}
            tabIndex={canGoNext ? undefined : -1}
            onClick={(e) => {
              e.preventDefault();
              if (canGoNext) onPageChange(nextPage);
            }}
            className={
              !canGoNext ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
