import { Table, Skeleton } from '@/shared/components/ui';

// ======= types =======
interface ExamTableSkeletonProps {
  itemsPerPage?: number;
}

interface ExamTableEmptyRowsProps {
  count: number;
}

// ======= components =======
export function ExamTableSkeleton({
  itemsPerPage = 10,
}: ExamTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <Table.Row key={`skeleton-${index}`} className='[&_td]:h-[24px]'>
          <Table.Cell className='w-[50px]'>
            <Skeleton className='mx-auto h-2 w-2 rounded-full' />
          </Table.Cell>
          <Table.Cell className='w-[200px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[120px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[60px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[84px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[60px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[60px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[110px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
          <Table.Cell className='w-[80px]'>
            <Skeleton className='h-4 w-full' />
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  );
}

export function ExamTableEmpty() {
  return (
    <Table.Row>
      <Table.Cell colSpan={9} className='h-[240px] p-0 text-gray-500'>
        <div className='flex h-full items-center justify-center'>
          해당하는 데이터가 없습니다
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export function ExamTableEmptyRows({ count }: ExamTableEmptyRowsProps) {
  if (count <= 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Table.Row key={`empty-${index}`} className='[&_td]:h-[24px]'>
          <Table.Cell className='w-[50px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[200px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[120px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[60px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[84px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[60px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[60px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[110px]'>&nbsp;</Table.Cell>
          <Table.Cell className='w-[80px]'>&nbsp;</Table.Cell>
        </Table.Row>
      ))}
    </>
  );
}
