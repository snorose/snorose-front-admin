import { Skeleton, Table } from '@/shared/components/ui';

// ======= types =======
interface ExamTableSkeletonProps {
  itemsPerPage?: number;
  columnCount?: number;
}

interface ExamTableEmptyRowsProps {
  count: number;
  columnCount?: number;
}

interface ExamTableEmptyProps {
  columnCount?: number;
}

// ======= components =======
export function ExamTableSkeleton({
  itemsPerPage = 10,
  columnCount = 5,
}: ExamTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <Table.Row key={`skeleton-${index}`} className='[&_td]:h-[40px]'>
          {Array.from({ length: columnCount }).map((_, cellIndex) => (
            <Table.Cell key={`skeleton-${index}-${cellIndex}`}>
              <Skeleton className='h-4 w-full' />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
}

export function ExamTableEmpty({ columnCount = 5 }: ExamTableEmptyProps) {
  return (
    <Table.Row>
      <Table.Cell colSpan={columnCount} className='h-[240px] p-0 text-gray-500'>
        <div className='flex h-full items-center justify-center'>
          해당하는 데이터가 없습니다
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export function ExamTableEmptyRows({
  count,
  columnCount = 5,
}: ExamTableEmptyRowsProps) {
  if (count <= 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Table.Row key={`empty-${index}`} className='[&_td]:h-[24px]'>
          {Array.from({ length: columnCount }).map((_, cellIndex) => (
            <Table.Cell key={`empty-${index}-${cellIndex}`}>&nbsp;</Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
}
