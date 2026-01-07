import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { PencilIcon, Trash2 } from 'lucide-react';
import {
  PointFreezeDeleteConfirmModal,
  PointFreezeUpdateConfirmModal,
} from '@/domains/Points';
import type { PointFreeze } from '@/types';

export default function PointFreezeListSection({
  pointFreezes,
  getPointFreezes,
}: {
  pointFreezes: PointFreeze[];
  getPointFreezes: () => void;
}) {
  const [selectedItem, setSelectedItem] = useState<PointFreeze | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleDeleteScheduleClick = (id: number) => {
    const deletedItem = pointFreezes.find((item) => item.id === id);

    if (deletedItem) {
      setSelectedItem(deletedItem);
      setIsDeleteModalOpen(true);
    }
  };

  const handleUpdateScheduleButtonClick = (id: number) => {
    const updatedItem = pointFreezes.find((item) => item.id === id);
    if (updatedItem) {
      setSelectedItem(updatedItem);
      setIsUpdateModalOpen(true);
    }
  };

  return (
    <>
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

      <PointFreezeDeleteConfirmModal
        isDeleteModalOpen={isDeleteModalOpen}
        selectedItem={selectedItem as PointFreeze}
        onSuccess={() => {
          getPointFreezes();
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
      />

      <PointFreezeUpdateConfirmModal
        isUpdateModalOpen={isUpdateModalOpen}
        selectedItem={selectedItem as PointFreeze}
        onSuccess={() => {
          getPointFreezes();
          setIsUpdateModalOpen(false);
          setSelectedItem(null);
        }}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
}
