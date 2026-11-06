import { X } from 'lucide-react';

import { PaginationBar, StatusBadge, TableStateRow } from '@/shared/components';
import { Button, Table } from '@/shared/components/ui';

import type { Notice } from '../types';
import NoticeTableRow from './NoticeTableRow';

interface NoticeTableProps {
  notices: Notice[];
  latestId?: number;
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
  latestId,
  currentPage,
  totalPage,
  selectedAuthorName,
  onPageChange,
  onClearAuthor,
  onViewMemberInfo,
  onViewAuthorNotices,
}: NoticeTableProps) {
  return (
    <section aria-label='공지사항 목록' className='flex min-w-0 flex-col gap-3'>
      <p className='text-xs leading-5 text-gray-500'>
        최신 공지 1개 → 직접 고정 최대 4개 → 임시저장 → 예약 → 게시 → 비공개
        순으로 표시합니다. 정렬 옵션은 같은 우선순위 안에서 적용됩니다.
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
        <Table className='min-w-[1320px] table-fixed text-[13px]'>
          <Table.Header className='h-[42px] bg-gray-50'>
            <Table.Row>
              <Table.Head className='w-[80px] px-3'>ID</Table.Head>
              <Table.Head className='w-[145px] px-3'>게시판</Table.Head>
              <Table.Head className='w-[100px] px-3 text-center'>
                구분
              </Table.Head>
              <Table.Head className='w-[360px] px-3'>제목 / 내용</Table.Head>
              <Table.Head className='w-[125px] px-3'>작성자</Table.Head>
              <Table.Head className='w-[90px] px-3'>통계</Table.Head>
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
            {notices.length === 0 && (
              <TableStateRow
                state='empty'
                colSpan={9}
                message='조건에 맞는 공지사항이 없습니다.'
              />
            )}
            {notices.map((notice) => (
              <NoticeTableRow
                key={notice.id}
                notice={notice}
                latestId={latestId}
                onViewMemberInfo={onViewMemberInfo}
                onViewNotices={() => onViewAuthorNotices(notice)}
              />
            ))}
          </Table.Body>
        </Table>
      </div>
      <PaginationBar
        currentPage={currentPage}
        totalPage={totalPage}
        onPageChange={onPageChange}
      />
    </section>
  );
}
