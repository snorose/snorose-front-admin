import {
  getNoticeBoard,
  getNoticeBoardById,
  getNoticeCategories,
} from '../constants/boards';
import type {
  AdminCreateNoticeRequest,
  AdminNoticeListItem,
  AdminNoticeStatus,
  AdminUpdateNoticeRequest,
  Notice,
  NoticeForm,
  NoticeStatus,
} from '../types';
import { toNoticeHtml } from './content';

const UI_STATUS: Record<AdminNoticeStatus, NoticeStatus> = {
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  DRAFT: 'draft',
  PRIVATE: 'private',
};

export function fromAdminNoticeStatus(status: AdminNoticeStatus): NoticeStatus {
  return UI_STATUS[status];
}

export function toNoticeLocalDateTime(value: string) {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))
    return value.length === 16 ? `${value}:00` : value;
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date(value))
    .replace(' ', 'T');
}

export type NoticeEditorDetails = Pick<
  Notice,
  | 'createdAt'
  | 'publishedAt'
  | 'scheduledAt'
  | 'category'
  | 'attachments'
  | 'authorId'
>;

// 목록에 없는 작성자 ID·작성/예약 이력·카테고리·첨부는 알 수 없는 값으로 남깁니다.
export function fromAdminNotice(
  item: AdminNoticeListItem,
  details?: NoticeEditorDetails
): Notice {
  return {
    createdAt: '',
    publishedAt: null,
    scheduledAt: '',
    category: '',
    attachments: [],
    attachmentsKnown: details?.attachments !== undefined,
    authorId: '',
    ...details,
    id: item.postId,
    boardId: item.boardId,
    board: getNoticeBoardById(item.boardId)?.name ?? item.boardName,
    title: item.title,
    content: item.content,
    author: item.adminNickname,
    status: UI_STATUS[item.status],
    isNew: item.isNew,
    pinned: item.isPinned,
    updatedAt: /(?:Z|[+-]\d{2}:\d{2})$/i.test(item.updatedAt)
      ? item.updatedAt
      : `${item.updatedAt}+09:00`,
    views: item.viewCount,
    likes: item.likeCount,
    scraps: item.scrapCount,
  };
}

export function toUpdateNoticeRequest(
  original: Notice,
  form: NoticeForm,
  status: NoticeStatus
): AdminUpdateNoticeRequest {
  const request: AdminUpdateNoticeRequest = {};
  const board = getNoticeBoard(form.board);
  if (!board) throw new Error('게시판을 선택해 주세요.');
  if (form.board !== original.board) request.boardId = board.id;
  if (form.category !== original.category) request.category = form.category;
  if (form.title.trim() !== original.title.trim())
    request.title = form.title.trim();
  const content = toNoticeHtml(form.content);
  if (content !== toNoticeHtml(original.content)) request.content = content;
  const attachmentsChanged =
    JSON.stringify(form.attachments) !== JSON.stringify(original.attachments);
  if (attachmentsChanged) {
    if (original.attachmentsKnown === false)
      throw new Error(
        '기존 첨부 정보를 확인하지 못해 첨부를 변경할 수 없습니다.'
      );
    request.images = form.attachments.map((attachment) => {
      const type = attachment.type.startsWith('image/')
        ? ('PHOTO' as const)
        : attachment.type.startsWith('video/')
          ? ('VIDEO' as const)
          : null;
      if (!type) throw new Error('이미지와 동영상만 첨부할 수 있습니다.');
      if (
        !attachment.file &&
        (!Number.isSafeInteger(attachment.attachmentId) ||
          attachment.attachmentId! <= 0)
      )
        throw new Error('기존 첨부파일 ID를 확인할 수 없습니다.');
      return {
        id: attachment.file ? null : attachment.attachmentId!,
        type,
        fileName: attachment.name,
        fileComment: attachment.fileComment ?? '',
      };
    });
  }
  if (status === 'scheduled') {
    if (original.status !== 'draft' && original.status !== 'scheduled')
      throw new Error('게시·비공개 공지는 예약할 수 없습니다.');
    if (
      original.status !== 'scheduled' ||
      form.scheduledAt !== original.scheduledAt
    )
      request.scheduledAt = toNoticeLocalDateTime(form.scheduledAt);
  } else if (status !== original.status) {
    if (
      status === 'draft' ||
      (original.status === 'draft' && status === 'private')
    )
      throw new Error('이 상태로 공지를 변경할 수 없습니다.');
    request.isVisible = status === 'published';
  }
  return request;
}

export function toCreateNoticeRequest(
  form: NoticeForm,
  status: Exclude<NoticeStatus, 'private'>
): AdminCreateNoticeRequest {
  const board = getNoticeBoard(form.board);
  if (!board) throw new Error('게시판을 선택해 주세요.');
  const category = getNoticeCategories(form.board).includes(form.category)
    ? form.category
    : '';
  return {
    boardId: board.id,
    ...(category ? { category } : {}),
    title: form.title.trim(),
    content: toNoticeHtml(form.content),
    images: form.attachments.map((attachment) => {
      const type = attachment.type.startsWith('image/')
        ? 'PHOTO'
        : attachment.type.startsWith('video/')
          ? 'VIDEO'
          : null;
      if (!type) throw new Error('이미지와 동영상만 첨부할 수 있습니다.');
      return {
        type,
        fileName: attachment.name,
        fileComment: attachment.fileComment ?? '',
      };
    }),
    isDraft: status === 'draft',
    isScheduled: status === 'scheduled',
    scheduledAt:
      status === 'scheduled' ? toNoticeLocalDateTime(form.scheduledAt) : null,
  };
}
