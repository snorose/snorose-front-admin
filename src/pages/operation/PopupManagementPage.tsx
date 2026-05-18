import { Search } from 'lucide-react';

import { PageHeader } from '@/shared/components';
import { Badge, Button, Input, Table } from '@/shared/components/ui';

const popupStatusItems = [
  {
    label: '진행 중',
    value: 0,
  },
  {
    label: '예약',
    value: 0,
  },
  {
    label: '종료',
    value: 0,
  },
] as const;

export default function PopupManagementPage() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='팝업창 관리'
        description='서비스에 노출할 팝업창을 조회하고 관리할 수 있어요.'
      />

      <section className='grid gap-3 md:grid-cols-3'>
        {popupStatusItems.map((item) => (
          <article
            key={item.label}
            className='flex flex-col gap-2 rounded-md border p-4'
          >
            <span className='text-sm text-gray-500'>{item.label}</span>
            <strong className='text-2xl font-bold'>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className='flex flex-col gap-4 rounded-md border p-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div className='relative w-full md:max-w-sm'>
            <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400' />
            <Input
              className='pl-9'
              placeholder='팝업명 검색'
              aria-label='팝업명 검색'
            />
          </div>
          <Button type='button'>새 팝업 등록</Button>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>상태</Table.Head>
              <Table.Head>팝업명</Table.Head>
              <Table.Head>노출 기간</Table.Head>
              <Table.Head>노출 위치</Table.Head>
              <Table.Head>수정일</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={5} className='h-40 text-center'>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <Badge variant='outline'>등록된 팝업 없음</Badge>
                  <p className='text-sm text-gray-500'>
                    등록된 팝업창이 없습니다.
                  </p>
                </div>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
    </div>
  );
}
