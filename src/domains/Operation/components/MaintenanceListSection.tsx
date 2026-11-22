import { SectionTitle, StatusBadge } from '@/shared/components';
import { Button, Skeleton, Table } from '@/shared/components/ui';
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
}

export function MaintenanceListSection({
  items,
  isLoading = false,
  isFetching = false,
  errorMessage,
  onRetry,
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
                '일정 제목',
                '시작 일시',
                '종료 일시',
                '생성 일시',
                '수정 일시',
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
                <Table.Cell colSpan={7}>
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
                      item.updatedAt,
                    ].map((date, index) => (
                      <Table.Cell
                        key={index}
                        className='text-center whitespace-nowrap'
                      >
                        {formatDateTimeToMinutes(date)}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7} className='text-center'>
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
