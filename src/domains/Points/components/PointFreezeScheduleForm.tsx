import { Label, Input, Button } from '@/components/ui';
import { DateTimePicker } from '@/components';
import { useState } from 'react';
import { postPointFreezeAPI } from '@/apis';
import { toast } from 'sonner';
import { getErrorMessage, formatDateTimeForAPI } from '@/utils';
import { useDateTimeField } from '@/hooks';
import { format } from 'date-fns';

interface PointFreezeScheduleFormProps {
  onSuccess: () => void;
}

export default function PointFreezeScheduleForm({
  onSuccess,
}: PointFreezeScheduleFormProps) {
  const [title, setTitle] = useState('');

  const startDateTime = useDateTimeField();
  const endDateTime = useDateTimeField();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const getDateTimeString = (date: Date | undefined, time: string): string => {
    if (!date) return '';
    const dateStr = format(date, 'yyyy-MM-dd');
    return `${dateStr}T${time}`;
  };

  const handleResetButtonClick = () => {
    setTitle('');
    startDateTime.reset();
    endDateTime.reset();
  };

  const handleCreateButtonClick = async () => {
    const startAt = getDateTimeString(startDateTime.date, startDateTime.time);
    const endAt = getDateTimeString(endDateTime.date, endDateTime.time);

    if (title === '' || startAt === '' || endAt === '') {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      await postPointFreezeAPI({
        title,
        startAt: formatDateTimeForAPI(startAt),
        endAt: formatDateTimeForAPI(endAt),
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
      date: startDateTime.date,
      time: startDateTime.time,
      onDateSelect: startDateTime.onDateSelect,
      onTimeChange: startDateTime.onTimeChange,
      datePlaceholder: '시작 날짜 선택',
    },
    {
      label: '종료 일시',
      date: endDateTime.date,
      time: endDateTime.time,
      onDateSelect: endDateTime.onDateSelect,
      onTimeChange: endDateTime.onTimeChange,
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
              value={title}
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
