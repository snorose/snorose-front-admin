import { ResultCount, type ResultCountProps } from './ResultCount';
import { SectionTitle } from './SectionTitle';

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
    <div className='flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-1'>
      <SectionTitle id={titleId} className='max-w-full min-w-0 break-words'>
        {title}
      </SectionTitle>
      <ResultCount totalCount={totalCount} status={status} />
    </div>
  );
}
