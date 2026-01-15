import { STATUS_COLOR } from '@/constants/exam-table-options';

interface ExamStatusDotProps {
  status: string;
}

export default function ExamStatusDot({ status }: ExamStatusDotProps) {
  const getStatusColor = (status: string) => {
    const statusColor = STATUS_COLOR.find((color) => color.code === status);
    return statusColor?.color || 'bg-white';
  };

  return (
    <div className='flex items-center justify-center'>
      <div
        className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
        title={status}
      />
    </div>
  );
}
