import { Pagination } from '@/shared/components/ui';

interface PaginationBarProps {
  /** 1부터 시작하는 현재 페이지 */
  currentPage: number;
  /** 1부터 시작하는 페이지 번호를 전달한다. */
  onPageChange: (page: number) => void;
  totalPage: number;
}

function getBlockStartPage(page: number) {
  return Math.floor((page - 1) / 10) * 10 + 1;
}

export function PaginationBar({
  currentPage,
  onPageChange,
  totalPage,
}: PaginationBarProps) {
  const blockStart = getBlockStartPage(currentPage);
  const previousPage = Math.max(1, blockStart - 10);
  const nextPage = blockStart + 10;
  const lastPage = Math.max(1, totalPage);
  const canGoPrevious = blockStart > 1;
  const canGoNext = blockStart + 9 < lastPage;
  const startPage = blockStart;
  const endPage = Math.min(startPage + 9, lastPage);
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
