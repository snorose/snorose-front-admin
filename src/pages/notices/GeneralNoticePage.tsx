import { PageHeader } from '@/shared/components';

import NoticeFilterPanel from '@/domains/Notices/components/NoticeFilterPanel';
import NoticeTable from '@/domains/Notices/components/NoticeTable';
import { useNoticeListState } from '@/domains/Notices/hooks/useNoticeListState';

export default function GeneralNoticePage() {
  const {
    filters,
    authorSearch,
    authorSelectionVersion,
    updateFilters,
    resetFilters,
    ...tableProps
  } = useNoticeListState();
  const initialFilters = { ...filters, keywordAuthor: authorSearch };
  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <PageHeader
        title='일반 공지 관리'
        description='전체 게시판의 공지사항을 관리할 수 있습니다.'
      />
      <NoticeFilterPanel
        key={JSON.stringify([
          filters.keyword ?? '',
          authorSearch,
          filters.author ?? '',
          authorSelectionVersion,
        ])}
        initialFilters={initialFilters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />
      <NoticeTable {...tableProps} />
    </div>
  );
}
