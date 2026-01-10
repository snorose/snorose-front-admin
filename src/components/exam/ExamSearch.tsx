export default function ExamSearch() {
  return (
    <div className='flex flex-col gap-2 py-3'>
      {/* 검색 input + 조회 버튼 */}
      <div className='flex items-center gap-2'>
        <input
          type='text'
          placeholder='검색'
          className='h-7 w-full rounded-md border-1 border-gray-500 bg-white px-2 py-2 text-xs'
        />
        <button className='hover flex h-7 w-18 items-center justify-center rounded-md border !border-gray-300 !bg-gray-100 text-[12px] font-medium !text-gray-700 transition-colors hover:border-blue-500 focus:border-blue-500'>
          조회
        </button>
      </div>

      {/* 조회기간 */}
      {/* <div className='flex items-center gap-4'>
        <span className='text-xs font-medium'>조회기간</span>
        <label className='flex items-center gap-1 text-[10px] whitespace-nowrap'>
          <input
            type='date'
            className='cursor-pointer rounded-sm border border-gray-300 px-2 py-0.5 hover:border-blue-500 focus:border-blue-500 focus:outline-none'
            onClick={(e) =>
              e.currentTarget.showPicker && e.currentTarget.showPicker()
            }
          />
          부터
        </label>
        <label className='flex items-center gap-1 text-[10px] whitespace-nowrap'>
          <input
            type='date'
            className='cursor-pointer rounded-sm border border-gray-300 px-2 py-0.5 hover:border-blue-500 focus:border-blue-500 focus:outline-none'
            onClick={(e) =>
              e.currentTarget.showPicker && e.currentTarget.showPicker()
            }
          />
          까지
        </label>
      </div> */}
    </div>
  );
}
