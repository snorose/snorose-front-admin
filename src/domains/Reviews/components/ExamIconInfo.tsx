import { STATUS_COLOR } from '@/shared/constants';

export default function ExamIconInfo() {
  return (
    <div>
      <ul>
        {/* 상태 리스트 */}
        {STATUS_COLOR.map((status) => (
          <li key={status.id} className='text-[12px] font-medium text-gray-800'>
            <span
              className={`inline-block h-3 w-3 rounded-full ${status.color} mr-2 align-middle`}
            />
            {status.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
