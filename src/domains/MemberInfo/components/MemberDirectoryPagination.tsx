import { Pagination } from '@/shared/components/ui';

type MemberDirectoryPaginationProps = {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
};

const PAGE_BLOCK_SIZE = 10;

export default function MemberDirectoryPagination({
  currentPage,
  totalPage,
  onPageChange,
}: MemberDirectoryPaginationProps) {
  const currentPageNumber = currentPage + 1;
  const lastPage = Math.max(totalPage, 1);
  const startPage =
    Math.floor((currentPageNumber - 1) / PAGE_BLOCK_SIZE) * PAGE_BLOCK_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, lastPage);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
  const previousBlockPage = Math.max(1, startPage - PAGE_BLOCK_SIZE);
  const nextBlockPage = Math.min(startPage + PAGE_BLOCK_SIZE, lastPage);
  const hasNextBlock = endPage < lastPage;

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

        {pageNumbers.map((page) => (
          <Pagination.Item key={page}>
            <Pagination.Link
              href='#'
              isActive={page === currentPageNumber}
              onClick={(event) => {
                event.preventDefault();
                onPageChange(page - 1);
              }}
            >
              {page}
            </Pagination.Link>
          </Pagination.Item>
        ))}

        <Pagination.Item>
          <Pagination.Next
            href='#'
            onClick={(event) => {
              event.preventDefault();
              if (hasNextBlock) {
                onPageChange(nextBlockPage - 1);
              }
            }}
            className={
              !hasNextBlock ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
