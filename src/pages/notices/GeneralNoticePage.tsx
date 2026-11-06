import { Link } from 'react-router-dom';

import { Plus } from 'lucide-react';

import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import NoticeFilterPanel from '@/domains/Notices/components/NoticeFilterPanel';
import NoticeTable from '@/domains/Notices/components/NoticeTable';
import { useNoticeListState } from '@/domains/Notices/hooks/useNoticeListState';

export default function GeneralNoticePage() {
  const {
    filters,
    authorSearch,
    totalCount,
    updateFilters,
    resetFilters,
    ...tableProps
  } = useNoticeListState();
  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <PageHeader
          title='일반 공지 관리'
          description='전체 게시판의 공지사항을 관리할 수 있습니다.'
        />
        <Button asChild className='!text-white'>
          <Link to={PATHS.NOTICE_CREATE}>
            <Plus className='size-4' aria-hidden='true' />
            공지사항 작성하기
          </Link>
        </Button>
      </div>
      <NoticeFilterPanel
        filters={filters}
        authorSearch={authorSearch}
        totalCount={totalCount}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />
      <NoticeTable {...tableProps} />
    </div>
  );
}
