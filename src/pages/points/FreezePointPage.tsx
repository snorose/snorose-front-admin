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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { useState, useEffect } from 'react';
import { getFreezingPointsAPI } from '@/apis';
import { toast } from 'sonner';
import { PencilIcon, Trash2 } from 'lucide-react';

interface FreezingPoint {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function FreezingPointPage() {
  const [freezingPoints, setFreezingPoints] = useState<FreezingPoint[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
  });
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FreezingPoint | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const handleDeleteScheduleClick = (id: number) => {
    const deletedItem = freezingPoints.find((item) => item.id === id);
    if (deletedItem) {
      setSelectedItem(deletedItem);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      setFreezingPoints(
        freezingPoints.filter((item) => item.id !== selectedItem.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, endDate: e.target.value });
  };

  const handleUpdateScheduleClick = (id: number) => {
    setIsUpdateModalOpen(true);
    const updatedItem = freezingPoints.find((item) => item.id === id);

    if (updatedItem) {
      setSelectedItem(updatedItem);
      setUpdateFormData({
        title: updatedItem.title,
        startDate: updatedItem.startAt,
        endDate: updatedItem.endAt,
      });
    }
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalOpen(false);
    setSelectedItem(null);
  };

  const handleUpdateConfirm = () => {
    console.log(selectedItem);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFreezingPointsAPI();
        setFreezingPoints(data.result as FreezingPoint[]);
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
          <h3 className='text-lg font-bold'>미지급 일정 조회</h3>
          <Table className='w-full'>
            <TableHeader>
              <TableRow className='text-center'>
                <TableHead className='text-center'>ID</TableHead>
                <TableHead className='text-center'>일정 제목</TableHead>
                <TableHead className='text-center'>시작 일시</TableHead>
                <TableHead className='text-center'>종료 일시</TableHead>
                <TableHead className='text-center'>생성 일시</TableHead>
                <TableHead className='text-center'>수정 일시</TableHead>
                <TableHead className='text-center'>삭제</TableHead>
                <TableHead className='text-center'>수정</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {freezingPoints.length > 0 ? (
                freezingPoints.map(
                  ({ id, title, startAt, endAt, createdAt, updatedAt }) => (
                    <TableRow key={id}>
                      <TableCell className='text-center'>{id}</TableCell>
                      <TableCell className='text-center'>{title}</TableCell>
                      <TableCell className='text-center'>{startAt}</TableCell>
                      <TableCell className='text-center'>{endAt}</TableCell>
                      <TableCell className='text-center'>{createdAt}</TableCell>
                      <TableCell className='text-center'>{updatedAt}</TableCell>
                      <TableCell className='items-center justify-center align-middle'>
                        <Trash2
                          className='h-4 w-4 cursor-pointer text-gray-500 active:text-gray-800'
                          onClick={() => handleDeleteScheduleClick(id)}
                        />
                      </TableCell>
                      <TableCell className='items-center justify-center align-middle'>
                        <PencilIcon
                          className='h-4 w-4 cursor-pointer text-gray-500 active:text-gray-800'
                          onClick={() => handleUpdateScheduleClick(id)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className='text-center'>
                    등록된 일정이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </article>
      </section>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='max-w-xs sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>일정 삭제</DialogTitle>
            <DialogDescription>
              아래 내용으로 포인트 미지급 일정을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-3'>
            <ul className='ml-4 list-outside list-disc'>
              <li>
                <span className='text-sm font-semibold'>일정 제목: </span>
                <span className='text-sm'>{selectedItem?.title}</span>
              </li>
              <li>
                <span className='text-sm font-semibold'>시작 일시: </span>
                <span className='text-sm'>{selectedItem?.startAt}</span>
              </li>
              <li>
                <span className='text-sm font-semibold'>종료 일시: </span>
                <span className='text-sm'>{selectedItem?.endAt}</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleDeleteCancel()}
            >
              취소
            </Button>
            <Button type='button' onClick={handleDeleteConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className='max-w-xs sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
            <DialogDescription>
              아래 내용으로 포인트 미지급 일정을 수정하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-3'>
            <Label className='text-sm font-semibold'>일정 제목: </Label>
            <Input
              type='text'
              id='title'
              value={updateFormData.title}
              onChange={handleTitleChange}
            />
            <Label className='text-sm font-semibold'>시작 일시: </Label>
            <Input
              type='datetime-local'
              id='startDate'
              value={updateFormData.startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className='flex flex-col gap-3'>
            <Label className='text-sm font-semibold'>종료 일시: </Label>
            <Input
              type='datetime-local'
              id='endDate'
              value={updateFormData.endDate}
              onChange={handleEndDateChange}
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleUpdateCancel()}
            >
              취소
            </Button>
            <Button type='button' onClick={() => handleUpdateConfirm()}>
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
