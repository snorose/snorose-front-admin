import { Pagination } from '@/shared/components/ui';

interface PaginationBarProps {
  /** 1부터 시작하는 현재 페이지 */
  currentPage: number;
  /** 1부터 시작하는 페이지 번호를 전달한다. */
  onPageChange: (page: number) => void;
  hasNext?: boolean;
  totalPage?: number;
}

function getBlockStartPage(page: number) {
  return Math.floor((page - 1) / 10) * 10 + 1;
}

export function PaginationBar({
  currentPage,
  onPageChange,
  hasNext = false,
  totalPage,
}: PaginationBarProps) {
  const blockStart = getBlockStartPage(currentPage);
  const prevBlockStart = Math.max(1, blockStart - 10);
  const nextBlockStart = blockStart + 10;
  const canGoPrevious = blockStart > 1;
  const lastPage = Math.max(1, totalPage ?? nextBlockStart);
  const canGoNext =
    totalPage === undefined ? hasNext : blockStart + 9 < lastPage;

  return (
    <Pagination className='py-2'>
      <Pagination.Content className='flex flex-wrap items-center justify-center gap-1'>
        <Pagination.Item>
          <Pagination.Previous
            href='#'
            onClick={(e) => {
              e.preventDefault();
              if (canGoPrevious) onPageChange(prevBlockStart);
            }}
            className={
              !canGoPrevious ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </Pagination.Item>
        {(() => {
          const startPage = blockStart;
          const endPage =
            totalPage !== undefined
              ? Math.min(startPage + 9, lastPage)
              : startPage + 9;

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
                  onPageChange(page);
                }}
                className={currentPage === page ? 'cursor-default' : undefined}
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
              if (canGoNext) onPageChange(nextBlockStart);
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
