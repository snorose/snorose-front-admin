import { PageHeader } from '@/components';
import { Label, Input, Button } from '@/components/ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getPointFreezesAPI, postPointFreezeAPI } from '@/apis';
import { toast } from 'sonner';
import type { PointFreeze } from '@/types';
import { PointFreezeListSection } from '@/domains/Points';

export default function PointFreezePage() {
  const [pointFreezes, setPointFreezes] = useState<PointFreeze[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    startAt: '',
    endAt: '',
  });

  const isFetchingRef = useRef(false);

  const getPointFreezes = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const data = await getPointFreezesAPI();
      setPointFreezes(data.result as PointFreeze[]);
    } catch {
      toast.error('미지급 일정 조회에 실패했습니다.');
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, startAt: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, endAt: e.target.value });
  };

  const handleResetButtonClick = () => {
    setFormData({
      title: '',
      startAt: '',
      endAt: '',
    });
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

    const formatDateTime = (dateTimeString: string) => {
      return dateTimeString.replace('T', ' ') + ':00';
    };
    try {
      await postPointFreezeAPI({
        title: formData.title,
        startAt: formatDateTime(formData.startAt),
        endAt: formatDateTime(formData.endAt),
      });
      toast.success('미지급 일정 생성이 완료되었어요.');
      handleResetButtonClick();
      await getPointFreezes();
    } catch (error: unknown) {
      const errorMessage =
        error?.response?.data?.message || '미지급 일정 생성에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    getPointFreezes();
  }, [getPointFreezes]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='미지급 일정 관리'
        description='포인트 미지급 일정을 생성, 조회, 수정, 삭제할 수 있어요.'
      />

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
                onChange={handleTitleChange}
              />
            </div>
            <div className='flex gap-1'>
              <div className='flex w-1/2 flex-col gap-1'>
                <Label htmlFor='startDate' required>
                  시작 일시
                </Label>
                <Input
                  type='datetime-local'
                  id='startDate'
                  value={formData.startAt}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className='flex w-1/2 flex-col gap-1'>
                <Label htmlFor='endDate' required>
                  종료 일시
                </Label>
                <Input
                  type='datetime-local'
                  id='endDate'
                  value={formData.endAt}
                  onChange={handleEndDateChange}
                />
              </div>
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

      <PointFreezeListSection
        pointFreezes={pointFreezes}
        getPointFreezes={getPointFreezes}
      />
    </div>
  );
}
