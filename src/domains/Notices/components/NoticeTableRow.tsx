import { Link } from 'react-router-dom';

import { Bookmark, Eye, Heart, Pencil, Pin } from 'lucide-react';

import { MemberInfoPopover, StatusBadge } from '@/shared/components';
import { Button, Table } from '@/shared/components/ui';

import { getNoticeAuthorId } from '@/apis/notices';

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
  onViewNotices: () => void;
}

export default function NoticeTableRow({
  notice,
  canEdit,
  onViewNotices,
}: NoticeTableRowProps) {
  const isNew = notice.status === 'published' && notice.isNew;
  const updatedAtLabel = formatNoticeDate(notice.updatedAt);
  const [updatedDate, period, updatedTime] =
    updatedAtLabel.split(/\s(오전|오후)\s/);
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
      <Table.Cell className='px-1.5 font-mono text-[11px] text-gray-500'>
        {notice.id}
      </Table.Cell>
      <Table.Cell className='px-1.5' title={notice.board}>
        <StatusBadge tone='outline'>{notice.board}</StatusBadge>
      </Table.Cell>
      <Table.Cell className='px-1.5 text-center'>
        {isNew ? (
          <StatusBadge tone='danger'>NEW</StatusBadge>
        ) : notice.status === 'published' && notice.pinned ? (
          <StatusBadge tone='accent'>
            <Pin className='size-3' aria-hidden='true' />
            고정됨
          </StatusBadge>
        ) : (
          <StatusBadge tone='neutral'>일반</StatusBadge>
        )}
      </Table.Cell>
      <Table.Cell className='px-1.5 py-2'>
        <p className='truncate font-bold text-gray-900' title={notice.title}>
          {notice.title}
        </p>
        <p
          className='mt-1 truncate text-xs text-gray-500'
          title={noticeContentToText(notice.content)}
        >
          {noticeContentToText(notice.content) || '작성된 본문이 없습니다.'}
        </p>
      </Table.Cell>
      <Table.Cell className='relative px-1.5 font-bold text-gray-900'>
        {notice.author ? (
          <MemberInfoPopover
            key={`${notice.authorId}:${notice.author}`}
            encryptedUserId={notice.authorId}
            displayName={notice.author}
            showSanctionAction={false}
            resolveMemberId={() => getNoticeAuthorId(notice.author)}
            onViewNotices={onViewNotices}
          />
        ) : (
          <span>정보 없음</span>
        )}
      </Table.Cell>
      <Table.Cell className='px-1.5 py-1.5 text-center'>
        <div className='mx-auto grid w-fit max-w-full gap-0.5 font-mono text-[11px] text-gray-500'>
          <span
            className='flex min-w-0 items-center gap-0.5'
            title={`조회수 ${notice.views.toLocaleString()}`}
            aria-label={`조회수 ${notice.views}`}
          >
            <Eye
              className='size-3.5 shrink-0 text-gray-400'
              aria-hidden='true'
            />
            <span className='truncate'>{notice.views.toLocaleString()}</span>
          </span>
          <span
            className='flex min-w-0 items-center gap-0.5'
            title={`공감수 ${notice.likes.toLocaleString()}`}
            aria-label={`공감수 ${notice.likes}`}
          >
            <Heart
              className='size-3.5 shrink-0 fill-rose-50 text-rose-400'
              aria-hidden='true'
            />
            <span className='truncate'>{notice.likes.toLocaleString()}</span>
          </span>
          <span
            className='flex min-w-0 items-center gap-0.5'
            title={`스크랩수 ${notice.scraps.toLocaleString()}`}
            aria-label={`스크랩수 ${notice.scraps}`}
          >
            <Bookmark
              className='size-3.5 shrink-0 fill-amber-50 text-amber-400'
              aria-hidden='true'
            />
            <span className='truncate'>{notice.scraps.toLocaleString()}</span>
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className='px-1.5 text-center'>
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
      <Table.Cell className='px-1.5 text-xs !whitespace-normal text-gray-600'>
        <time
          dateTime={notice.updatedAt}
          className='block'
          title={updatedAtLabel}
        >
          <span className='block whitespace-nowrap'>{updatedDate}</span>
          {period && (
            <span className='block whitespace-nowrap'>
              {period} {updatedTime}
            </span>
          )}
        </time>
      </Table.Cell>
      <Table.Cell className='px-1.5 text-center'>
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
