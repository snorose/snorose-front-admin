interface MemberInfoPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  groupSize?: number;
}

const BUTTON_BASE_CLASSNAME =
  'rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50';

export default function MemberInfoPagination({
  currentPage,
  totalPages,
  onPageChange,
  groupSize = 10,
}: MemberInfoPaginationProps) {
  const currentGruop = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGruop * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);

  // 페이지 배열
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
  return (
    <div className='relative flex flex-col items-center gap-3 px-4 py-4'>
      <div className='flex items-center gap-2'>
        {/* 이전 그룹으로 이동 - 페이지 그룹 사이즈만큼*/}
        <button
          onClick={() => onPageChange(Math.max(1, startPage - groupSize))}
          disabled={startPage === 1}
          className={BUTTON_BASE_CLASSNAME}
        >
          ◀◀
        </button>

        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={BUTTON_BASE_CLASSNAME}
        >
          이전
        </button>

        {/* 페이지 번호 배열 */}
        <div className='flex items-center gap-1'>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={page > totalPages}
              className={`rounded px-3 py-1 text-xs ${
                currentPage === page
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={BUTTON_BASE_CLASSNAME}
        >
          다음
        </button>

        {/* 이후 그룹으로 이동 */}
        <button
          onClick={() =>
            onPageChange(Math.min(totalPages, startPage + groupSize))
          }
          disabled={endPage === totalPages}
          className={BUTTON_BASE_CLASSNAME}
        >
          ▶▶
        </button>
      </div>
    </div>
  );
}
