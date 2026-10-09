import { MoreHorizontalIcon } from 'lucide-react';

import { PeriodStatusBadge } from '@/shared/components';
import { Button, DropdownMenu, Table } from '@/shared/components/ui';

import type { ServerMaintenance } from '../types/maintenance';

interface Props {
  items: ServerMaintenance[];
  onEdit: (item: ServerMaintenance) => void;
  onDelete: (item: ServerMaintenance) => void;
}

export function MaintenanceListSection({ items, onEdit, onDelete }: Props) {
  return (
    <section
      className='flex w-full flex-col gap-1'
      aria-labelledby='maintenance-list-title'
    >
      <h2 id='maintenance-list-title' className='text-lg font-bold'>
        서버 점검 일정 조회
      </h2>
      <div className='overflow-x-auto rounded-md border'>
        <Table className='w-full min-w-[920px]'>
          <Table.Header>
            <Table.Row>
              {[
                '번호',
                '상태',
                '일정 제목',
                '시작 일시',
                '종료 일시',
                '생성 일시',
                '수정 일시',
                '더보기',
              ].map((label) => (
                <Table.Head key={label} className='text-center'>
                  {label}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={8} className='h-24 text-center'>
                  등록된 일정이 없습니다.
                </Table.Cell>
              </Table.Row>
            ) : (
              items.map((item, index) => {
                return (
                  <Table.Row key={item.id}>
                    <Table.Cell className='text-center'>{index + 1}</Table.Cell>
                    <Table.Cell className='text-center'>
                      <PeriodStatusBadge
                        startAt={item.startAt}
                        endAt={item.endAt}
                      />
                    </Table.Cell>
                    <Table.Cell
                      className='max-w-56 truncate text-center'
                      title={item.title}
                    >
                      {item.title}
                    </Table.Cell>
                    <Table.Cell className='text-center whitespace-nowrap'>
                      {item.startAt.replace('T', ' ')}
                    </Table.Cell>
                    <Table.Cell className='text-center whitespace-nowrap'>
                      {item.endAt.replace('T', ' ')}
                    </Table.Cell>
                    <Table.Cell className='text-center whitespace-nowrap'>
                      {item.createdAt.replace('T', ' ')}
                    </Table.Cell>
                    <Table.Cell className='text-center whitespace-nowrap'>
                      {item.updatedAt.replace('T', ' ')}
                    </Table.Cell>
                    <Table.Cell className='text-center'>
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`${item.title} 서버 점검 일정 메뉴 열기`}
                          >
                            <MoreHorizontalIcon aria-hidden='true' />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align='end'>
                          <DropdownMenu.Item onClick={() => onEdit(item)}>
                            수정
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item
                            variant='destructive'
                            onClick={() => onDelete(item)}
                          >
                            삭제
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </div>
    </section>
  );
}
