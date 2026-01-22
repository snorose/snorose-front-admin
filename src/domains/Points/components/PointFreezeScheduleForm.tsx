import { Label, Input, Button } from '@/components/ui';
import { DateTimePicker } from '@/components';
import { useState } from 'react';
import { postPointFreezeAPI } from '@/apis';
import { toast } from 'sonner';
import { getErrorMessage, formatDateTimeForAPI } from '@/utils';
import { format } from 'date-fns';

interface PointFreezeScheduleFormProps {
  onSuccess: () => void;
}

export default function PointFreezeScheduleForm({
  onSuccess,
}: PointFreezeScheduleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    startAt: '',
    endAt: '',
  });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id in formData) {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      setFormData((prev) => ({
        ...prev,
        startAt: `${dateStr}T${startTime}`,
      }));
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      setFormData((prev) => ({
        ...prev,
        endAt: `${dateStr}T${endTime}`,
      }));
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setStartTime(time);
    if (startDate) {
      const dateStr = format(startDate, 'yyyy-MM-dd');
      setFormData((prev) => ({
        ...prev,
        startAt: `${dateStr}T${time}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        startAt: '',
      }));
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setEndTime(time);
    if (endDate) {
      const dateStr = format(endDate, 'yyyy-MM-dd');
      setFormData((prev) => ({
        ...prev,
        endAt: `${dateStr}T${time}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        endAt: '',
      }));
    }
  };

  const handleResetButtonClick = () => {
    setFormData({
      title: '',
      startAt: '',
      endAt: '',
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('00:00');
    setEndTime('00:00');
  };

  const handleCreateButtonClick = async () => {
    if (
      formData.title === '' ||
      formData.startAt === '' ||
      formData.endAt === ''
    ) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      await postPointFreezeAPI({
        title: formData.title,
        startAt: formatDateTimeForAPI(formData.startAt),
        endAt: formatDateTimeForAPI(formData.endAt),
      });
      toast.success('미지급 일정 생성이 완료되었어요.');
      handleResetButtonClick();
      onSuccess();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '미지급 일정 생성에 실패했습니다.'));
    }
  };

  // 날짜/시간 입력 필드 설정
  const dateTimeFields = [
    {
      label: '시작 일시',
      date: startDate,
      time: startTime,
      onDateSelect: handleStartDateSelect,
      onTimeChange: handleStartTimeChange,
      datePlaceholder: '시작 날짜 선택',
    },
    {
      label: '종료 일시',
      date: endDate,
      time: endTime,
      onDateSelect: handleEndDateSelect,
      onTimeChange: handleEndTimeChange,
      datePlaceholder: '종료 날짜 선택',
    },
  ];

  return (
    <section className='flex flex-col gap-4'>
      <article className='flex w-full flex-col gap-1'>
        <h3 className='text-lg font-bold'>미지급 일정 생성</h3>
        <div className='flex w-full flex-col gap-4 rounded-md border p-4 pb-5'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='title' required>
              일정 제목
            </Label>
            <Input
              type='text'
              id='title'
              placeholder='예: 2026-1학기 중간고사'
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className='flex gap-4'>
            {dateTimeFields.map((field, index) => (
              <DateTimePicker
                key={index}
                label={field.label}
                date={field.date}
                time={field.time}
                onDateSelect={field.onDateSelect}
                onTimeChange={field.onTimeChange}
                datePlaceholder={field.datePlaceholder}
                required
                className='w-1/2'
              />
            ))}
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='w-16 cursor-pointer font-bold text-red-400 hover:text-red-400 active:text-red-600'
              onClick={handleResetButtonClick}
            >
              초기화
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='w-16 cursor-pointer font-bold'
              onClick={handleCreateButtonClick}
            >
              생성
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
}
