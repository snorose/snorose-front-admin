import { Skeleton, Table } from '@/shared/components/ui';

const COL_WIDTHS = ['60px', '120px', '140px', '80px', '200px', '160px', '80px'];
const COL_COUNT = COL_WIDTHS.length;

interface InquiryTableSkeletonProps {
  itemsPerPage?: number;
}

interface InquiryTableEmptyRowsProps {
  count: number;
}

export function InquiryTableSkeleton({
  itemsPerPage = 10,
}: InquiryTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <Table.Row key={`skeleton-${index}`} className='[&_td]:h-[40px]'>
          {COL_WIDTHS.map((w, i) => (
            <Table.Cell key={i} style={{ width: w }}>
              <Skeleton className='h-4 w-full' />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
}

export function InquiryTableEmpty() {
  return (
    <Table.Row>
      <Table.Cell colSpan={COL_COUNT} className='h-[240px] p-0 text-gray-500'>
        <div className='flex h-full items-center justify-center'>
          해당하는 데이터가 없습니다
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export function InquiryTableEmptyRows({ count }: InquiryTableEmptyRowsProps) {
  if (count <= 0) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Table.Row key={`empty-${index}`} className='[&_td]:h-[24px]'>
          {COL_WIDTHS.map((w, i) => (
            <Table.Cell key={i} style={{ width: w }}>
              &nbsp;
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
}
