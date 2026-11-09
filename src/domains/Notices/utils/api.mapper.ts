import { getNoticeBoard, getNoticeCategories } from '../constants/boards';
import type {
  AdminCreateNoticeRequest,
  AdminNoticeListItem,
  AdminNoticeStatus,
} from '../types';
import type { Notice, NoticeForm, NoticeStatus } from '../types';
import { toNoticeHtml } from './content';

const API_STATUS: Record<NoticeStatus, AdminNoticeStatus> = {
  published: 'PUBLISHED',
  scheduled: 'SCHEDULED',
  draft: 'DRAFT',
  private: 'PRIVATE',
};
const UI_STATUS: Record<AdminNoticeStatus, NoticeStatus> = {
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  DRAFT: 'draft',
  PRIVATE: 'private',
};

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
    authorId: '',
    ...details,
    id: item.postId,
    boardId: item.boardId,
    board: item.boardName,
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

export function toAdminNotice(notice: Notice): AdminNoticeListItem {
  return {
    postId: notice.id,
    boardId: notice.boardId,
    boardName: notice.board,
    title: notice.title,
    content: notice.content,
    adminNickname: notice.author,
    viewCount: notice.views,
    likeCount: notice.likes,
    scrapCount: notice.scraps,
    status: API_STATUS[notice.status],
    isNew: notice.isNew,
    isPinned: notice.pinned,
    updatedAt: toNoticeLocalDateTime(notice.updatedAt),
  };
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
