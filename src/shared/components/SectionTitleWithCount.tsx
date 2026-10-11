import { ResultCount, type ResultCountProps } from './ResultCount';
import { SectionTitle } from './SectionTitle';

export interface SectionTitleWithCountProps extends ResultCountProps {
  title: string;
  titleId?: string;
}

export function SectionTitleWithCount({
  title,
  titleId,
  totalCount,
  status,
}: SectionTitleWithCountProps) {
  return (
    <div className='flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-1'>
      <SectionTitle id={titleId} className='max-w-full min-w-0 break-words'>
        {title}
      </SectionTitle>
      <ResultCount totalCount={totalCount} status={status} />
    </div>
  );
}
