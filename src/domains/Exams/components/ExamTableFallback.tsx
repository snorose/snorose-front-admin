import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

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
        <TableRow
          key={`skeleton-${index}`}
          size='sm'
          className='[&_td]:h-[24px]'
        >
          <TableCell size='sm' className='w-[70px] text-center'>
            <Skeleton className='mx-auto h-4 w-8' />
          </TableCell>
          <TableCell size='sm' className='w-[50px]'>
            <Skeleton className='mx-auto h-2 w-2 rounded-full' />
          </TableCell>
          <TableCell size='sm' className='w-[200px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[120px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[60px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[84px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[60px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[60px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[150px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[110px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
          <TableCell size='sm' className='w-[80px]'>
            <Skeleton className='h-4 w-full' />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function ExamTableEmpty() {
  return (
    <TableRow size='sm'>
      <TableCell size='sm' colSpan={11} className='h-[240px] p-0 text-gray-500'>
        <div className='flex h-full items-center justify-center'>
          해당하는 데이터가 없습니다
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ExamTableEmptyRows({ count }: ExamTableEmptyRowsProps) {
  if (count <= 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={`empty-${index}`} size='sm' className='[&_td]:h-[24px]'>
          <TableCell size='sm' className='w-[70px] text-center text-gray-600'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[50px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[200px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[120px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[60px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[84px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[60px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[60px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[150px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[110px]'>
            &nbsp;
          </TableCell>
          <TableCell size='sm' className='w-[80px]'>
            &nbsp;
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
