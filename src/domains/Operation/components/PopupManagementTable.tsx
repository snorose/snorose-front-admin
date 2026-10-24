import { CircleHelpIcon } from 'lucide-react';

import { Badge, Button, Table, Tooltip } from '@/shared/components/ui';

import type { PopupSummary } from '@/domains/Operation/types/popup';

type PopupManagementTableProps = {
  popups: PopupSummary[];
  getStatusLabel: (popup: PopupSummary) => string;
  getStatusClassName: (popup: PopupSummary) => string;
  onUpdate: (popup: PopupSummary) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
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
  disabled = false,
}: PopupManagementTableProps) {
  return (
    <div className='overflow-x-auto rounded-lg border'>
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
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        className='cursor-help'
                        aria-label='게시 기간 안내'
                      >
                        <CircleHelpIcon className='size-4' aria-hidden='true' />
                      </Button>
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
                  {popup.displayOrder}
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
                <Table.Cell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='xs'
                      disabled={disabled}
                      onClick={() => onUpdate(popup)}
                    >
                      수정
                    </Button>
                    <Button
                      type='button'
                      variant='destructive-outline'
                      size='xs'
                      disabled={disabled}
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
