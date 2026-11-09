import { useId } from 'react';
import { Link } from 'react-router-dom';

import { Plus, X } from 'lucide-react';

import {
  PaginationBar,
  SectionTitleWithCount,
  StatusBadge,
  TableStateRow,
} from '@/shared/components';
import { Button, Table } from '@/shared/components/ui';
import { PATHS } from '@/shared/constants';

import type { Notice } from '../types';
import NoticeTableRow from './NoticeTableRow';

interface NoticeTableProps {
  notices: Notice[];
  totalCount: number | undefined;
  countStatus: 'loading' | 'ready' | 'error';
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  canEdit: boolean;
  currentPage: number;
  totalPage: number;
  selectedAuthorName?: string;
  onPageChange: (page: number) => void;
  onClearAuthor: () => void;
  onViewMemberInfo: (authorId: string) => void;
  onViewAuthorNotices: (notice: Notice) => void;
}

export default function NoticeTable({
  notices,
  totalCount,
  countStatus,
  isLoading,
  isError,
  onRetry,
  canEdit,
  currentPage,
  totalPage,
  selectedAuthorName,
  onPageChange,
  onClearAuthor,
  onViewMemberInfo,
  onViewAuthorNotices,
}: NoticeTableProps) {
  const titleId = useId();
  const state = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : notices.length === 0
        ? 'empty'
        : null;
  return (
    <section aria-labelledby={titleId} className='flex min-w-0 flex-col gap-1'>
      <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
        <SectionTitleWithCount
          title='공지사항 목록'
          titleId={titleId}
          totalCount={totalCount}
          status={countStatus}
        />
        <Button asChild className='ml-auto !text-white'>
          <Link to={PATHS.NOTICE_CREATE}>
            <Plus className='size-4' aria-hidden='true' />
            공지사항 작성하기
          </Link>
        </Button>
      </div>
      <p className='text-xs leading-5 text-gray-500'>
        게시판별 최신 공지 → 고정 공지 → 임시저장 → 예약 → 게시 → 비공개 순으로
        표시합니다. 정렬 옵션은 같은 우선순위 안에서 적용됩니다.
      </p>
      {selectedAuthorName && (
        <div className='flex items-center gap-2 text-sm'>
          <StatusBadge tone='info'>{selectedAuthorName}의 공지</StatusBadge>
          <Button size='sm' variant='ghost' onClick={onClearAuthor}>
            <X className='size-3' />
            선택 해제
          </Button>
        </div>
      )}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <Table className='w-full min-w-[1390px] table-fixed text-[13px]'>
          <Table.Header className='h-[42px] border-b border-gray-200'>
            <Table.Row>
              <Table.Head className='w-[80px] px-3'>ID</Table.Head>
              <Table.Head className='w-[145px] px-3'>게시판</Table.Head>
              <Table.Head className='w-[100px] px-3 text-center'>
                구분
              </Table.Head>
              <Table.Head className='w-[360px] px-3'>제목 / 내용</Table.Head>
              <Table.Head className='w-[125px] px-3'>작성자</Table.Head>
              <Table.Head className='w-[160px] px-3 text-center'>
                통계
              </Table.Head>
              <Table.Head className='w-[100px] px-3 text-center'>
                상태
              </Table.Head>
              <Table.Head className='w-[205px] px-3'>마지막 수정일</Table.Head>
              <Table.Head className='w-[75px] px-3 text-center'>
                수정
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state && (
              <TableStateRow
                state={state}
                colSpan={9}
                message={
                  state === 'empty'
                    ? '조건에 맞는 공지사항이 없습니다.'
                    : undefined
                }
              />
            )}
            {!state &&
              notices.map((notice) => (
                <NoticeTableRow
                  key={notice.id}
                  notice={notice}
                  canEdit={canEdit}
                  onViewMemberInfo={onViewMemberInfo}
                  onViewNotices={() => onViewAuthorNotices(notice)}
                />
              ))}
          </Table.Body>
        </Table>
      </div>
      {isError && (
        <Button variant='outline' className='self-center' onClick={onRetry}>
          다시 조회
        </Button>
      )}
      {!isLoading && !isError && (
        <PaginationBar
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
