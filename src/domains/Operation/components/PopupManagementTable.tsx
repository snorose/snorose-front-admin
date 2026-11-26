import { Eye, MoreHorizontalIcon, Pencil, Trash2 } from 'lucide-react';

import { Badge, Button, DropdownMenu, Table } from '@/shared/components/ui';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { PopupSummary } from '@/domains/Operation/types/popup';

type PopupManagementTableProps = {
  popups: PopupSummary[];
  getStatusLabel: (popup: PopupSummary) => string;
  getStatusClassName: (popup: PopupSummary) => string;
  onDetail: (popup: PopupSummary) => void;
  onUpdate: (popup: PopupSummary) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
};

export function PopupManagementTable({
  popups,
  getStatusLabel,
  getStatusClassName,
  onDetail,
  onUpdate,
  onDelete,
  disabled = false,
}: PopupManagementTableProps) {
  return (
    <div className='overflow-x-auto rounded-lg border'>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className='text-center'>노출 순번</Table.Head>
            <Table.Head className='text-center'>상태</Table.Head>
            <Table.Head className='text-center'>팝업 제목</Table.Head>
            <Table.Head className='text-center'>게시일</Table.Head>
            <Table.Head className='text-center'>생성일시</Table.Head>
            <Table.Head className='text-center'>수정일시</Table.Head>
            <Table.Head className='text-center'>더보기</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {popups.length > 0 ? (
            popups.map((popup) => (
              <Table.Row key={popup.id}>
                <Table.Cell className='text-center'>
                  {popup.displayOrder}
                </Table.Cell>
                <Table.Cell className='text-center'>
                  <Badge
                    variant='outline'
                    className={getStatusClassName(popup)}
                  >
                    {getStatusLabel(popup)}
                  </Badge>
                </Table.Cell>
                <Table.Cell className='max-w-[280px]'>
                  <button
                    type='button'
                    className='block max-w-full truncate text-left font-medium hover:underline focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50'
                    disabled={disabled}
                    onClick={() => onDetail(popup)}
                    aria-haspopup='dialog'
                    title={popup.title || '제목 없는 팝업'}
                  >
                    {popup.title || '제목 없는 팝업'}
                  </button>
                </Table.Cell>
                <Table.Cell className='text-center'>
                  {popup.startDate} ~ {popup.endDate}
                </Table.Cell>
                <Table.Cell className='text-center'>
                  {formatDateTimeToMinutes(popup.createdAt)}
                </Table.Cell>
                <Table.Cell className='text-center'>
                  {formatDateTimeToMinutes(popup.updatedAt)}
                </Table.Cell>
                <Table.Cell className='text-center'>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        disabled={disabled}
                        aria-label={`${popup.title || '제목 없는 팝업'} 팝업 메뉴 열기`}
                      >
                        <MoreHorizontalIcon aria-hidden='true' />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align='end'>
                      <DropdownMenu.Item onClick={() => onDetail(popup)}>
                        <Eye aria-hidden='true' />
                        상세 조회
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={() => onUpdate(popup)}>
                        <Pencil aria-hidden='true' />
                        수정
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        variant='destructive'
                        onClick={() => onDelete(popup.id)}
                      >
                        <Trash2 aria-hidden='true' />
                        삭제
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={7} className='h-40 text-center'>
                <p className='text-sm text-gray-500'>
                  등록된 팝업창이 없습니다.
                </p>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
