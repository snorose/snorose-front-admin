import { STATUS_COLOR, ICON_INFO_LIST } from '@/constants/exam-table-options';

export default function ExamIconInfo() {
  return (
    <div className='flex items-center gap-4 px-4 pb-3'>
      <ul>
        {/* 상태 리스트 */}
        {STATUS_COLOR.map((status) => (
          <li key={status.id} className='text-[8px] font-medium text-gray-800'>
            <span
              className={`inline-block h-2 w-2 rounded-full ${status.color} mr-2 align-middle`}
            />
            {status.name}
          </li>
        ))}
      </ul>
      <ul>
        {/* 아이콘 정보 리스트 */}
        {ICON_INFO_LIST.map((status) => (
          <li key={status.id} className='text-[8px] font-medium text-gray-800'>
            {/* <Icon icon={status.icon} /> */}
            {status.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
