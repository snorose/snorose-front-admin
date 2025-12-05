export default function ExamPeriod() {
  return (
    <div className='mb-6 flex items-center gap-4 text-sm'>
      조회기간
      <label className='flex items-center gap-1 whitespace-nowrap'>
        <input
          type='date'
          className='cursor-pointer rounded-sm border border-gray-300 px-2 py-1 hover:border-blue-500 focus:border-blue-500 focus:outline-none'
          onClick={(e) =>
            e.currentTarget.showPicker && e.currentTarget.showPicker()
          }
        />
        부터
      </label>
      <label className='flex items-center gap-1 whitespace-nowrap'>
        <input
          type='date'
          className='cursor-pointer rounded-sm border border-gray-300 px-2 py-1 hover:border-blue-500 focus:border-blue-500 focus:outline-none'
          onClick={(e) =>
            e.currentTarget.showPicker && e.currentTarget.showPicker()
          }
        />
        까지
      </label>
      <button className='hover flex h-7.5 w-24 items-center justify-center rounded-md border !border-gray-300 !bg-gray-100 text-[12px] font-medium !text-gray-700 transition-colors hover:border-blue-500 focus:border-blue-500'>
        조회
      </button>
    </div>
  );
}
