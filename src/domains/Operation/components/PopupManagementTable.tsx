import { MoreHorizontalIcon } from 'lucide-react';

import { Badge, Button, DropdownMenu, Table } from '@/shared/components/ui';

import type { PopupContent } from '@/domains/Operation/types';

type PopupManagementTableProps = {
  popups: PopupContent[];
  getStatusLabel: (popup: PopupContent) => string;
  getStatusClassName: (popup: PopupContent) => string;
  onUpdate: (popup: PopupContent) => void;
  onDelete: (id: number) => void;
};

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
            <Table.Head>상태</Table.Head>
            <Table.Head>팝업명</Table.Head>
            <Table.Head>게시 기간</Table.Head>
            <Table.Head>생성일시</Table.Head>
            <Table.Head>수정일시</Table.Head>
            <Table.Head className='text-right'>더보기</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {popups.length > 0 ? (
            popups.map((popup) => (
              <Table.Row key={popup.id}>
                <Table.Cell>
                  <Badge
                    variant='outline'
                    className={getStatusClassName(popup)}
                  >
                    {getStatusLabel(popup)}
                  </Badge>
                </Table.Cell>
                <Table.Cell className='max-w-[280px]'>
                  <div className='truncate font-medium'>
                    {popup.title || '제목 없는 팝업'}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {popup.startDate || '-'} ~ {popup.endDate || '-'}
                </Table.Cell>
                <Table.Cell>{popup.createdAt || '-'}</Table.Cell>
                <Table.Cell>{popup.updatedAt || '-'}</Table.Cell>
                <Table.Cell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button variant='ghost' size='icon' className='size-7'>
                        <MoreHorizontalIcon />
                        <span className='sr-only'>팝업 관리 메뉴 열기</span>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align='end'>
                      <DropdownMenu.Item onClick={() => onUpdate(popup)}>
                        수정
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        variant='destructive'
                        onClick={() => onDelete(popup.id)}
                      >
                        삭제
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={6} className='h-40 text-center'>
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
