import { Link } from 'react-router-dom';

import { Bookmark, Eye, Heart, Pencil, Pin } from 'lucide-react';

import { MemberInfoPopover, StatusBadge } from '@/shared/components';
import { Button, Table } from '@/shared/components/ui';

import {
  NOTICE_ROW_TONES,
  NOTICE_STATUS_LABELS,
  NOTICE_STATUS_TONES,
} from '../constants';
import type { Notice } from '../types';
import { noticeContentToText } from '../utils/content';
import { formatNoticeDate } from '../utils/notice';

interface NoticeTableRowProps {
  notice: Notice;
  canEdit: boolean;
  onViewMemberInfo: (authorId: string) => void;
  onViewNotices: () => void;
}

export default function NoticeTableRow({
  notice,
  canEdit,
  onViewMemberInfo,
  onViewNotices,
}: NoticeTableRowProps) {
  const isNew = notice.status === 'published' && notice.isNew;
  return (
    <Table.Row
      className={
        isNew
          ? 'bg-blue-50/50'
          : notice.status === 'published' && notice.pinned
            ? 'bg-violet-50/30'
            : NOTICE_ROW_TONES[notice.status]
      }
    >
      <Table.Cell className='px-3 font-mono text-xs text-gray-500'>
        {notice.id}
      </Table.Cell>
      <Table.Cell className='px-3'>
        <StatusBadge tone='outline'>{notice.board}</StatusBadge>
      </Table.Cell>
      <Table.Cell className='px-3 text-center'>
        {isNew ? (
          <StatusBadge tone='danger'>NEW</StatusBadge>
        ) : notice.status === 'published' && notice.pinned ? (
          <StatusBadge tone='accent'>
            <Pin className='mr-1 size-3' aria-hidden='true' />
            고정됨
          </StatusBadge>
        ) : (
          <StatusBadge tone='neutral'>일반</StatusBadge>
        )}
      </Table.Cell>
      <Table.Cell className='px-3 py-2'>
        <p className='truncate font-bold text-gray-900' title={notice.title}>
          {notice.title}
        </p>
        <p className='mt-1 truncate text-xs text-gray-500'>
          {noticeContentToText(notice.content) || '작성된 본문이 없습니다.'}
        </p>
      </Table.Cell>
      <Table.Cell className='relative px-3 font-bold text-gray-900'>
        {notice.author ? (
          <MemberInfoPopover
            key={notice.authorId}
            encryptedUserId={notice.authorId}
            displayName={notice.author}
            showSanctionAction={false}
            onViewMemberInfo={
              notice.authorId
                ? () => onViewMemberInfo(notice.authorId)
                : undefined
            }
            onViewNotices={onViewNotices}
          />
        ) : (
          <span>정보 없음</span>
        )}
      </Table.Cell>
      <Table.Cell className='px-3 py-1.5 text-center'>
        <div className='mx-auto grid max-w-[110px] grid-cols-3 justify-items-start gap-x-2 gap-y-1 pl-1 font-mono text-[11px] text-gray-500'>
          <span
            className='flex items-center gap-0.5'
            title='조회수'
            aria-label={`조회수 ${notice.views}`}
          >
            <Eye className='size-3.5 text-gray-400' aria-hidden='true' />
            {notice.views.toLocaleString()}
          </span>
          <span
            className='flex items-center gap-0.5'
            title='공감수'
            aria-label={`공감수 ${notice.likes}`}
          >
            <Heart
              className='size-3.5 fill-rose-50 text-rose-400'
              aria-hidden='true'
            />
            {notice.likes.toLocaleString()}
          </span>
          <span
            className='flex items-center gap-0.5'
            title='스크랩수'
            aria-label={`스크랩수 ${notice.scraps}`}
          >
            <Bookmark
              className='size-3.5 fill-amber-50 text-amber-400'
              aria-hidden='true'
            />
            {notice.scraps.toLocaleString()}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className='px-3 text-center'>
        {notice.status === 'private' ? (
          <span className='rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-red-600'>
            비공개
          </span>
        ) : (
          <StatusBadge tone={NOTICE_STATUS_TONES[notice.status]}>
            {NOTICE_STATUS_LABELS[notice.status]}
          </StatusBadge>
        )}
      </Table.Cell>
      <Table.Cell className='px-3 text-xs text-gray-600'>
        {formatNoticeDate(notice.updatedAt)}
      </Table.Cell>
      <Table.Cell className='px-3 text-center'>
        {canEdit ? (
          <Button variant='ghost' size='icon-sm' asChild>
            <Link
              to={`/notices/general/${notice.id}/edit`}
              aria-label={`${notice.title} 수정`}
            >
              <Pencil className='size-4 text-gray-500' />
            </Link>
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon-sm'
            disabled
            aria-label={`${notice.title} 수정`}
            title='수정 기능은 준비 중입니다.'
          >
            <Pencil className='size-4 text-gray-500' />
          </Button>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
