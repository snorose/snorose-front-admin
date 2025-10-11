export default function ExamPeriod() {
  return (
    <div className='flex items-center gap-4 mb-6'>
      조회기간
      <label className='flex items-center gap-1 text-xl whitespace-nowrap'>
        <input
          type='date'
          className='border border-gray-300 rounded-sm px-2 py-1 cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:outline-none'
          onClick={(e) =>
            e.currentTarget.showPicker && e.currentTarget.showPicker()
          }
        />
        부터
      </label>
      <label className='flex items-center gap-1 text-xl whitespace-nowrap'>
        <input
          type='date'
          className='border border-gray-300 rounded-sm px-2 py-1 cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:outline-none'
          onClick={(e) =>
            e.currentTarget.showPicker && e.currentTarget.showPicker()
          }
        />
        까지
      </label>
      <button className='w-24 h-8 flex items-center justify-center text-xs !bg-gray-100 !text-gray-700 border !border-gray-300 transition-colors'>
        조회
      </button>
    </div>
  );
}
