import { ResultCount, type ResultCountProps } from './ResultCount';

export interface ListResultHeaderProps extends ResultCountProps {
  title: string;
  titleId?: string;
}

export function ListResultHeader({
  title,
  titleId,
  totalCount,
  status,
}: ListResultHeaderProps) {
  return (
    <div className='flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1'>
      <h2
        id={titleId}
        className='max-w-full min-w-0 text-lg font-bold break-words'
      >
        {title}
      </h2>
      <ResultCount totalCount={totalCount} status={status} />
    </div>
  );
}
