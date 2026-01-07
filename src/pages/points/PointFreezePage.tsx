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
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getPointFreezesAPI,
  postPointFreezeAPI,
  patchPointFreezeAPI,
  deletePointFreezeAPI,
} from '@/apis';
import { toast } from 'sonner';
import { PencilIcon, Trash2 } from 'lucide-react';
import type { PointFreeze } from '@/types';
import { PointFreezeDeleteConfirmModal } from '@/domains/Points';

export default function PointFreezePage() {
  const [pointFreezes, setPointFreezes] = useState<PointFreeze[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    startAt: '',
    endAt: '',
  });
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    startAt: '',
    endAt: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PointFreeze | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const handleDeleteScheduleClick = (id: number) => {
    const deletedItem = pointFreezes.find((item) => item.id === id);
    if (deletedItem) {
      setSelectedItem(deletedItem);
      setIsDeleteModalOpen(true);
    }
  };

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

  const handleDeleteConfirm = async () => {
    try {
      await deletePointFreezeAPI(selectedItem?.id as number);
      toast.success('미지급 일정 삭제가 완료되었어요.');
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      await getPointFreezes();
    } catch (error: unknown) {
      const errorMessage =
        error?.response?.data?.message || '미지급 일정 삭제에 실패했습니다.';
      toast.error(errorMessage);
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
    setFormData({ ...formData, startAt: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, endAt: e.target.value });
  };

  const handleTitleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateFormData({ ...updateFormData, title: e.target.value });
  };

  const handleStartDateUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUpdateFormData({ ...updateFormData, startAt: e.target.value });
  };

  const handleEndDateUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUpdateFormData({ ...updateFormData, endAt: e.target.value });
  };

  const handleUpdateScheduleButtonClick = (id: number) => {
    setIsUpdateModalOpen(true);
    const updatedItem = pointFreezes.find((item) => item.id === id);

    if (updatedItem) {
      setSelectedItem(updatedItem);

      const formatDateTime = (dateTimeString: string) => {
        return dateTimeString.replace(' ', 'T').slice(0, 16);
      };

      setUpdateFormData({
        ...updatedItem,
        startAt: formatDateTime(updatedItem.startAt),
        endAt: formatDateTime(updatedItem.endAt),
      });
    }
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalOpen(false);
    setSelectedItem(null);
  };

  const handleUpdateConfirm = async () => {
    const formatDateTime = (dateTimeString: string) => {
      return dateTimeString.replace('T', ' ') + ':00';
    };

    try {
      await patchPointFreezeAPI(selectedItem?.id as number, {
        title: updateFormData.title,
        startAt: formatDateTime(updateFormData.startAt),
        endAt: formatDateTime(updateFormData.endAt),
      });
      toast.success('미지급 일정 수정이 완료되었어요.');
      handleUpdateCancel();
      await getPointFreezes();
    } catch (error: unknown) {
      const errorMessage =
        error?.response?.data?.message || '미지급 일정 수정에 실패했습니다.';
      toast.error(errorMessage);
    }
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
              {pointFreezes.length > 0 ? (
                pointFreezes.map(
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
                          onClick={() => handleUpdateScheduleButtonClick(id)}
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

      <PointFreezeDeleteConfirmModal
        isDeleteModalOpen={isDeleteModalOpen}
        selectedItem={selectedItem as PointFreeze}
        handleDeleteConfirm={handleDeleteConfirm}
        handleDeleteCancel={handleDeleteCancel}
      />

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className='max-w-xs sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
            <DialogDescription>
              포인트 미지급 일정을 수정하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-1'>
            <Label className='text-sm font-semibold'>일정 제목: </Label>
            <Input
              type='text'
              id='title'
              value={updateFormData.title}
              onChange={handleTitleUpdateChange}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-sm font-semibold'>시작 일시: </Label>
            <Input
              type='datetime-local'
              id='startDate'
              value={updateFormData.startAt}
              onChange={handleStartDateUpdateChange}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-sm font-semibold'>종료 일시: </Label>
            <Input
              type='datetime-local'
              id='endDate'
              value={updateFormData.endAt}
              onChange={handleEndDateUpdateChange}
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
