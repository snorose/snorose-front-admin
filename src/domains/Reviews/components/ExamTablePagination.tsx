interface ExamTablePaginationProps {
  currentPage: number;
  hasNext: boolean;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

const BUTTON_BASE_CLASSNAME =
  'rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50';

export default function ExamTablePagination({
  currentPage,
  hasNext,
  onPageChange,
}: ExamTablePaginationProps) {
  return (
    <div className='relative flex flex-col items-center gap-3 py-2'>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => onPageChange((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={BUTTON_BASE_CLASSNAME}
        >
          이전
        </button>
        <div className='flex items-center gap-1'>
          {(() => {
            const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
            return Array.from({ length: 10 }, (_, i) => startPage + i).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`rounded px-3 py-1 text-xs ${
                    currentPage === page
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {page}
                </button>
              )
            );
          })()}
        </div>
        <button
          onClick={() => onPageChange((prev) => prev + 1)}
          disabled={!hasNext}
          className={BUTTON_BASE_CLASSNAME}
        >
          다음
        </button>
      </div>
    </div>
  );
}
