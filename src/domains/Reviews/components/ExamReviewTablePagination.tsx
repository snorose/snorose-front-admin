import { useState } from 'react';

import { Pagination } from '@/shared/components/ui';

interface ExamReviewTablePaginationProps {
  currentPage?: number;
  onPageChange?: (page: number | ((prev: number) => number)) => void;
  hasNext?: boolean;
}

export function ExamReviewTablePagination({
  currentPage: propCurrentPage,
  onPageChange,
  hasNext = false,
}: ExamReviewTablePaginationProps) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  const currentPage = propCurrentPage ?? internalCurrentPage;

  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    const newPage = typeof page === 'function' ? page(currentPage) : page;
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  return (
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
              if (hasNext) setCurrentPage((p) => p + 1);
            }}
            className={!hasNext ? 'pointer-events-none opacity-50' : undefined}
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
