import { CircleHelpIcon } from 'lucide-react';

import { Badge, Button, Table, Tooltip } from '@/shared/components/ui';

import type { PopupContent } from '@/domains/Operation/types';

type PopupManagementTableProps = {
  popups: PopupContent[];
  getStatusLabel: (popup: PopupContent) => string;
  getStatusClassName: (popup: PopupContent) => string;
  onUpdate: (popup: PopupContent) => void;
  onDelete: (id: number) => void;
};

function formatPopupDateTime(dateTime: string) {
  return dateTime ? dateTime.replace('T', ' ') : '-';
}

export function PopupManagementTable({
  popups,
  getStatusLabel,
  getStatusClassName,
  onUpdate,
  onDelete,
}: PopupManagementTableProps) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className='text-center'>상태</Table.Head>
            <Table.Head className='text-center'>노출 순서</Table.Head>
            <Table.Head>팝업명</Table.Head>
            <Table.Head>
              <div className='flex items-center gap-1'>
                <span>게시 기간</span>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <button
                        type='button'
                        className='text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-5 cursor-help items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none'
                        aria-label='게시 기간 안내'
                      >
                        <CircleHelpIcon className='size-4' aria-hidden='true' />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content side='top' sideOffset={4}>
                      설정한 기간에만 사용자 홈 화면에 노출됩니다.
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              </div>
            </Table.Head>
            <Table.Head>생성일시</Table.Head>
            <Table.Head>수정일시</Table.Head>
            <Table.Head className='text-center'>관리</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {popups.length > 0 ? (
            popups.map((popup) => (
              <Table.Row key={popup.id}>
                <Table.Cell className='text-center'>
                  <Badge
                    variant='outline'
                    className={getStatusClassName(popup)}
                  >
                    {getStatusLabel(popup)}
                  </Badge>
                </Table.Cell>
                <Table.Cell className='text-center'>
                  {popup.displayPriority}
                </Table.Cell>
                <Table.Cell className='max-w-[280px]'>
                  <div className='truncate font-medium'>
                    {popup.title || '제목 없는 팝업'}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {formatPopupDateTime(popup.startDate)} ~{' '}
                  {formatPopupDateTime(popup.endDate)}
                </Table.Cell>
                <Table.Cell>{popup.createdAt || '-'}</Table.Cell>
                <Table.Cell>{popup.updatedAt || '-'}</Table.Cell>
                <Table.Cell className='text-right'>
                  <div className='flex justify-center gap-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => onUpdate(popup)}
                    >
                      수정
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                      onClick={() => onDelete(popup.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={7} className='h-40 text-center'>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <Badge variant='outline'>팝업 없음</Badge>
                  <p className='text-sm text-gray-500'>
                    등록된 팝업창이 없습니다.
                  </p>
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
