import { useState } from 'react';

import { MoreHorizontalIcon } from 'lucide-react';

import { Button, DropdownMenu, Table } from '@/shared/components/ui';
import type { PointFreeze } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  PointFreezeDeleteConfirmModal,
  PointFreezeUpdateConfirmModal,
} from '@/domains/Points';

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
        <div className='overflow-hidden rounded-md border'>
          <Table className='w-full'>
            <Table.Header>
              <Table.Row className='text-center'>
                <Table.Head className='text-center'>번호</Table.Head>
                <Table.Head className='text-center'>일정 제목</Table.Head>
                <Table.Head className='text-center'>시작 일시</Table.Head>
                <Table.Head className='text-center'>종료 일시</Table.Head>
                <Table.Head className='text-center'>생성 일시</Table.Head>
                <Table.Head className='text-center'>수정 일시</Table.Head>
                <Table.Head className='text-center'>더보기</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pointFreezes.length > 0 ? (
                pointFreezes.map(
                  (
                    { id, title, startAt, endAt, createdAt, updatedAt },
                    index
                  ) => (
                    <Table.Row key={id}>
                      <Table.Cell className='text-center'>
                        {index + 1}
                      </Table.Cell>
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
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-6'
                            >
                              <MoreHorizontalIcon />
                              <span className='sr-only'>Open menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align='end'>
                            <DropdownMenu.Item
                              onClick={() =>
                                handleUpdateScheduleButtonClick(id)
                              }
                              className='cursor-pointer'
                            >
                              수정
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item
                              variant='destructive'
                              onClick={() => handleDeleteScheduleClick(id)}
                              className='cursor-pointer'
                            >
                              삭제
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu>
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
