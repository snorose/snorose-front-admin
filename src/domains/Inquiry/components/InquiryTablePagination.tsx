import { useState } from 'react';

import { Pagination } from '@/shared/components/ui';

interface InquiryTablePaginationProps {
  currentPage?: number;
  onPageChange?: (page: number | ((prev: number) => number)) => void;
  hasNext?: boolean;
  totalPages?: number;
}

export default function InquiryTablePagination({
  currentPage: propCurrentPage,
  onPageChange,
  hasNext = false,
  totalPages,
}: InquiryTablePaginationProps) {
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = propCurrentPage ?? internalPage;

  const setPage = (page: number | ((prev: number) => number)) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const endPage = totalPages
    ? Math.min(startPage + 9, totalPages)
    : startPage + 9;
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
              if (currentPage > 1) setPage((p) => p - 1);
            }}
            className={
              currentPage === 1 ? 'pointer-events-none opacity-50' : undefined
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
                setPage(page);
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
              if (hasNext) setPage((p) => p + 1);
            }}
            className={!hasNext ? 'pointer-events-none opacity-50' : undefined}
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
