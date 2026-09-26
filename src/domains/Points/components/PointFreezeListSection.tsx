import { useState } from 'react';

import { MoreHorizontalIcon } from 'lucide-react';

import { PeriodStatusBadge } from '@/shared/components';
import { Button, DropdownMenu, Skeleton, Table } from '@/shared/components/ui';
import type { PointFreeze } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  PointFreezeDeleteConfirmModal,
  PointFreezeUpdateConfirmModal,
} from '@/domains/Points/components';

export function PointFreezeListSection({
  pointFreezes,
  isLoading = false,
  isFetching = false,
  errorMessage,
  onRetry,
}: {
  pointFreezes: PointFreeze[];
  isLoading?: boolean;
  isFetching?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
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
        {errorMessage && (
          <div
            role='alert'
            className='flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm'
          >
            <span>{errorMessage}</span>
            {onRetry && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isFetching}
                onClick={onRetry}
              >
                다시 시도
              </Button>
            )}
          </div>
        )}
        <div
          className='overflow-x-auto rounded-md border'
          aria-busy={isFetching}
        >
          <Table className='w-full'>
            <Table.Header>
              <Table.Row className='text-center'>
                <Table.Head className='text-center'>번호</Table.Head>
                <Table.Head className='text-center'>상태</Table.Head>
                <Table.Head className='text-center'>일정 제목</Table.Head>
                <Table.Head className='text-center'>시작 일시</Table.Head>
                <Table.Head className='text-center'>종료 일시</Table.Head>
                <Table.Head className='text-center'>생성 일시</Table.Head>
                <Table.Head className='text-center'>수정 일시</Table.Head>
                <Table.Head className='text-center'>더보기</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={8}>
                    <span role='status' className='sr-only'>
                      미지급 일정을 불러오는 중입니다.
                    </span>
                    <Skeleton className='h-5 w-full' />
                  </Table.Cell>
                </Table.Row>
              ) : pointFreezes.length > 0 ? (
                pointFreezes.map(
                  (
                    { id, title, startAt, endAt, createdAt, updatedAt },
                    index
                  ) => (
                    <Table.Row key={id}>
                      <Table.Cell className='text-center'>
                        {index + 1}
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        <PeriodStatusBadge startAt={startAt} endAt={endAt} />
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
                            >
                              수정
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item
                              variant='destructive'
                              onClick={() => handleDeleteScheduleClick(id)}
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
                    {errorMessage
                      ? '미지급 일정을 불러오지 못했습니다.'
                      : '등록된 일정이 없습니다.'}
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
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </>
  );
}
