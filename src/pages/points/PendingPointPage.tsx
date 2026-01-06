import { PageHeader } from '@/components';
import {
  Label,
  Input,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { useState, useEffect } from 'react';
import { getPendingPointsAPI } from '@/apis';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface PendingPoint {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function PendingPointPage() {
  const [pendingPoints, setPendingPoints] = useState<PendingPoint[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, endDate: e.target.value });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPendingPointsAPI();
        setPendingPoints(data.result as PendingPoint[]);
      } catch {
        toast.error('미지급 일정 조회에 실패했습니다.');
      }
    };

    fetchData();
  }, []);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='미지급 일정 관리'
        description='포인트 미지급 일정을 생성, 조회, 수정, 삭제할 수 있어요.'
      />

      <section className='flex flex-col gap-4'>
        <article className='flex w-full flex-col gap-1'>
          <h3 className='text-lg font-bold'>일정 생성</h3>
          <div className='flex w-full flex-col gap-4 rounded-md border p-4 pb-5'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='title' required>
                미지급 일정 제목
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
                  value={formData.startDate}
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
                  value={formData.endDate}
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
              >
                초기화
              </Button>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='w-16 cursor-pointer font-bold'
              >
                생성
              </Button>
            </div>
          </div>
        </article>

        <article className='flex w-full flex-col gap-1'>
          <h3 className='text-lg font-bold'>일정 조회</h3>
          <Table className='w-full'>
            <TableHeader>
              <TableRow className='text-center'>
                <TableHead className='text-center'>ID</TableHead>
                <TableHead className='text-center'>미지급 일정 제목</TableHead>
                <TableHead className='text-center'>시작 일시</TableHead>
                <TableHead className='text-center'>종료 일시</TableHead>
                <TableHead className='text-center'>생성 일시</TableHead>
                <TableHead className='text-center'>수정 일시</TableHead>
                <TableHead className='text-center'>삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPoints.map(
                ({ id, title, startAt, endAt, createdAt, updatedAt }) => (
                  <TableRow key={id}>
                    <TableCell className='text-center'>{id}</TableCell>
                    <TableCell className='text-center'>{title}</TableCell>
                    <TableCell className='text-center'>{startAt}</TableCell>
                    <TableCell className='text-center'>{endAt}</TableCell>
                    <TableCell className='text-center'>{createdAt}</TableCell>
                    <TableCell className='text-center'>{updatedAt}</TableCell>
                    <TableCell className='items-center justify-center align-middle'>
                      {endAt > new Date().toISOString() && (
                        <Trash2 className='h-4 w-4 cursor-pointer text-gray-500 active:text-gray-800' />
                      )}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </article>
      </section>
    </div>
  );
}
