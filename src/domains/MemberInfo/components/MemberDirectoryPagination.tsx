import { Pagination } from '@/shared/components/ui';

type MemberDirectoryPaginationProps = {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
};

export default function MemberDirectoryPagination({
  currentPage,
  hasNextPage,
  onPageChange,
}: MemberDirectoryPaginationProps) {
  const currentPageNumber = currentPage + 1;
  const startPage = Math.floor((currentPageNumber - 1) / 10) * 10 + 1;
  const pageNumbers = Array.from(
    { length: 10 },
    (_, index) => startPage + index
  );
  const previousBlockPage = Math.max(1, startPage - 10);
  const nextBlockPage = startPage + 10;

  return (
    <Pagination className='py-2'>
      <Pagination.Content className='flex flex-wrap items-center justify-center gap-1'>
        <Pagination.Item>
          <Pagination.Previous
            href='#'
            onClick={(event) => {
              event.preventDefault();
              if (startPage > 1) {
                onPageChange(previousBlockPage - 1);
              }
            }}
            className={
              startPage === 1 ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </Pagination.Item>

        {pageNumbers.map((page) => {
          const isKnownPage =
            page <= currentPageNumber ||
            (page === currentPageNumber + 1 && hasNextPage);

          return (
            <Pagination.Item key={page}>
              <Pagination.Link
                href='#'
                isActive={page === currentPageNumber}
                onClick={(event) => {
                  event.preventDefault();
                  if (isKnownPage) {
                    onPageChange(page - 1);
                  }
                }}
                className={
                  !isKnownPage ? 'pointer-events-none opacity-40' : undefined
                }
              >
                {page}
              </Pagination.Link>
            </Pagination.Item>
          );
        })}

        <Pagination.Item>
          <Pagination.Next
            href='#'
            onClick={(event) => {
              event.preventDefault();
              if (hasNextPage) {
                onPageChange(nextBlockPage - 1);
              }
            }}
            className={
              !hasNextPage ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
