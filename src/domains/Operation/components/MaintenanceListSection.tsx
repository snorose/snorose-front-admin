import {
  Eye,
  MoreHorizontalIcon,
  Pencil,
  SquareCheck,
  Trash2,
} from 'lucide-react';

import { SectionTitle, StatusBadge } from '@/shared/components';
import { Button, DropdownMenu, Skeleton, Table } from '@/shared/components/ui';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { ServerMaintenanceListItem } from '../types/maintenance';

const STATUS_META = {
  SCHEDULED: { label: '예정', tone: 'warning' },
  IN_PROGRESS: { label: '진행중', tone: 'success' },
  COMPLETED: { label: '종료', tone: 'neutral' },
} as const;

interface Props {
  items: ServerMaintenanceListItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onComplete: (item: ServerMaintenanceListItem) => void;
  onDetail: (item: ServerMaintenanceListItem) => void;
  onEdit: (item: ServerMaintenanceListItem) => void;
  onDelete: (item: ServerMaintenanceListItem) => void;
}

export function MaintenanceListSection({
  items,
  isLoading = false,
  isFetching = false,
  errorMessage,
  onRetry,
  onComplete,
  onDetail,
  onEdit,
  onDelete,
}: Props) {
  return (
    <section
      className='flex w-full flex-col gap-1'
      aria-labelledby='maintenance-list-title'
    >
      <SectionTitle id='maintenance-list-title'>
        서버 점검 일정 조회
      </SectionTitle>
      {errorMessage && (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm'
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
      <div className='overflow-x-auto rounded-lg border' aria-busy={isFetching}>
        <Table className='w-full'>
          <Table.Header>
            <Table.Row className='text-center'>
              {[
                '번호',
                '상태',
                '관리용 일정 제목',
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
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={8}>
                  <span role='status' className='sr-only'>
                    서버 점검 일정을 불러오는 중입니다.
                  </span>
                  <Skeleton className='h-5 w-full' />
                </Table.Cell>
              </Table.Row>
            ) : items.length ? (
              items.map((item) => {
                const status = STATUS_META[item.status];
                return (
                  <Table.Row key={item.id}>
                    <Table.Cell className='text-center'>
                      {item.number}
                    </Table.Cell>
                    <Table.Cell className='text-center'>
                      <div className='flex items-center justify-center'>
                        <StatusBadge tone={status?.tone ?? 'neutral'}>
                          {status?.label ?? '알 수 없음'}
                        </StatusBadge>
                      </div>
                    </Table.Cell>
                    <Table.Cell
                      className='max-w-56 truncate text-center'
                      title={item.title}
                    >
                      {item.title}
                    </Table.Cell>
                    {[
                      item.startAt,
                      item.endAt,
                      item.createdAt,
                      item.updatedAt === item.createdAt ? '' : item.updatedAt,
                    ].map((date, index) => (
                      <Table.Cell
                        key={index}
                        className='text-center whitespace-nowrap'
                      >
                        {formatDateTimeToMinutes(date)}
                      </Table.Cell>
                    ))}
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
                          <DropdownMenu.Item onClick={() => onDetail(item)}>
                            <Eye aria-hidden='true' />
                            상세 조회
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onEdit(item)}>
                            <Pencil aria-hidden='true' />
                            수정
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          {item.status === 'IN_PROGRESS' && (
                            <DropdownMenu.Item
                              variant='destructive'
                              onClick={() => onComplete(item)}
                            >
                              <SquareCheck aria-hidden='true' />
                              즉시 종료
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item
                            variant='destructive'
                            disabled={item.status === 'IN_PROGRESS'}
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 aria-hidden='true' />
                            {item.status === 'IN_PROGRESS'
                              ? '삭제 (진행 중에는 불가)'
                              : '삭제'}
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan={8} className='text-center'>
                  {errorMessage
                    ? '서버 점검 일정을 불러오지 못했습니다.'
                    : '등록된 일정이 없습니다.'}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </section>
  );
}
