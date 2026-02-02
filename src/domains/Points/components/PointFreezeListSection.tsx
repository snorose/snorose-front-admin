import { useState } from 'react';

import { PencilIcon, Trash2 } from 'lucide-react';

import { Table } from '@/shared/components/ui';
import type { PointFreeze } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  PointFreezeDeleteConfirmModal,
  PointFreezeUpdateConfirmModal,
} from '@/domains/Points/components';

export function PointFreezeListSection({
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
        <div className='overflow-hidden rounded-md border'>
          <Table className='w-full'>
            <Table.Header>
              <Table.Row className='text-center'>
                <Table.Head className='text-center'>일정 제목</Table.Head>
                <Table.Head className='text-center'>시작 일시</Table.Head>
                <Table.Head className='text-center'>종료 일시</Table.Head>
                <Table.Head className='text-center'>생성 일시</Table.Head>
                <Table.Head className='text-center'>수정 일시</Table.Head>
                <Table.Head className='text-center'>삭제</Table.Head>
                <Table.Head className='text-center'>수정</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pointFreezes.length > 0 ? (
                pointFreezes.map(
                  ({ id, title, startAt, endAt, createdAt, updatedAt }) => (
                    <Table.Row key={id}>
                      <Table.Cell className='text-center'>{title}</Table.Cell>
                      <Table.Cell className='text-center'>
                        {formatDateTimeToMinutes(startAt)}
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        {formatDateTimeToMinutes(endAt)}
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        {formatDateTimeToMinutes(createdAt)}
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        {formatDateTimeToMinutes(updatedAt)}
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        <div className='flex items-center justify-center'>
                          <Trash2
                            className='h-4 w-4 cursor-pointer text-gray-500 active:text-gray-800'
                            onClick={() => handleDeleteScheduleClick(id)}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        <div className='flex items-center justify-center'>
                          <PencilIcon
                            className='h-4 w-4 cursor-pointer text-gray-500 active:text-gray-800'
                            onClick={() => handleUpdateScheduleButtonClick(id)}
                          />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                )
              ) : (
                <Table.Row>
                  <Table.Cell className='text-center' colSpan={8}>
                    등록된 일정이 없습니다.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </article>

      {isDeleteModalOpen && selectedItem && (
        <PointFreezeDeleteConfirmModal
          isDeleteModalOpen={isDeleteModalOpen}
          selectedItem={selectedItem as PointFreeze}
          onSuccess={() => {
            getPointFreezes();
          }}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

      {isUpdateModalOpen && selectedItem && (
        <PointFreezeUpdateConfirmModal
          isUpdateModalOpen={isUpdateModalOpen}
          selectedItem={selectedItem as PointFreeze}
          onSuccess={() => {
            getPointFreezes();
          }}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </>
  );
}
