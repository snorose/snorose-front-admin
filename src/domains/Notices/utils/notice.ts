import { NOTICE_BOARDS, NOTICE_BOARD_GROUPS } from '../constants';
import { getNoticeCategories } from '../constants/boards';
import {
  type Notice,
  type NoticeFilters,
  type NoticeForm,
  type NoticeStatus,
} from '../types';
import { validateNoticeAttachments } from './attachments';
import { hasNoticeContent, noticeContentToText, toNoticeHtml } from './content';

export function hasNoticeListFilters(filters: NoticeFilters) {
  return !!(
    filters.startDate ||
    filters.endDate ||
    filters.keyword?.trim() ||
    filters.keywordAuthor?.trim() ||
    filters.author ||
    filters.group ||
    filters.board ||
    filters.status ||
    filters.kind ||
    (filters.sort && filters.sort !== 'latest')
  );
}

export function sortNotices(notices: Notice[], sort = 'latest') {
  const serverOrder = new Map(
    notices.map((notice, index) => [notice.id, index])
  );
  const priority = (notice: Notice) => {
    if (notice.status === 'private') return 5;
    if (notice.status === 'draft') return 2;
    if (notice.status === 'scheduled') return 3;
    if (notice.isNew) return 0;
    return notice.pinned ? 1 : 4;
  };
  const date = (notice: Notice) =>
    Date.parse(
      notice.status === 'draft'
        ? notice.updatedAt
        : (notice.publishedAt ?? notice.createdAt)
    ) || 0;
  const order = (a: Notice, b: Notice) =>
    serverOrder.get(a.id)! - serverOrder.get(b.id)!;

  return [...notices].sort(
    (a, b) =>
      priority(a) - priority(b) ||
      (sort === 'oldest'
        ? date(a) - date(b) || -order(a, b)
        : sort === 'views'
          ? b.views - a.views
          : sort === 'likes'
            ? b.likes - a.likes
            : sort === 'scraps'
              ? b.scraps - a.scraps
              : date(b) - date(a)) ||
      date(b) - date(a) ||
      order(a, b)
  );
}

export function filterNotices(notices: Notice[], filters: NoticeFilters) {
  const group = NOTICE_BOARD_GROUPS.find(
    (item) => item.label === filters.group
  );
  const keyword = filters.keyword?.trim().toLocaleLowerCase();
  const keywordAuthor = filters.keywordAuthor?.trim().toLocaleLowerCase();
  return notices.filter((notice) => {
    if (filters.author && notice.authorId !== filters.author) return false;
    if (
      keywordAuthor &&
      !`${notice.author} ${notice.authorId}`
        .toLocaleLowerCase()
        .includes(keywordAuthor)
    )
      return false;
    if (filters.status && notice.status !== filters.status) return false;
    if (group && !group.boards.includes(notice.board)) return false;
    if (filters.board && notice.board !== filters.board) return false;
    const isNew = notice.status === 'published' && notice.isNew;
    if (filters.kind === 'new' && !isNew) return false;
    const isPinned = notice.status === 'published' && notice.pinned && !isNew;
    if (filters.kind === 'pinned' && !isPinned) return false;
    if (filters.kind === 'normal' && (isNew || isPinned)) return false;
    const updated = Date.parse(notice.updatedAt);
    if (
      filters.startDate &&
      updated < Date.parse(`${filters.startDate}T00:00:00+09:00`)
    )
      return false;
    if (
      filters.endDate &&
      updated >= Date.parse(`${filters.endDate}T00:00:00+09:00`) + 86_400_000
    )
      return false;
    const content = noticeContentToText(notice.content);
    const text =
      filters.scope === 'title'
        ? notice.title
        : filters.scope === 'content'
          ? content
          : `${notice.title} ${content}`;
    return !keyword || text.toLocaleLowerCase().includes(keyword);
  });
}

export function validateNotice(
  form: NoticeForm,
  status: NoticeStatus,
  notices: Notice[],
  editingId?: number,
  now = Date.now(),
  original?: Notice
) {
  if (!NOTICE_BOARDS.includes(form.board)) return '게시판을 선택해 주세요.';
  if (
    form.category &&
    form.category !== original?.category &&
    getNoticeCategories(form.board).length > 0 &&
    !getNoticeCategories(form.board).includes(form.category)
  )
    return '카테고리를 선택해 주세요.';
  const titleChanged = !original || form.title.trim() !== original.title.trim();
  const contentChanged =
    !original || toNoticeHtml(form.content) !== toNoticeHtml(original.content);
  const leavingDraft = original?.status === 'draft' && status !== 'draft';
  if ((titleChanged || leavingDraft) && !form.title.trim())
    return '제목을 입력해 주세요.';
  if ((titleChanged || leavingDraft) && form.title.trim().length > 127)
    return '제목은 최대 127자까지 입력할 수 있습니다.';
  if (form.category !== original?.category && form.category.length > 20)
    return '카테고리는 최대 20자까지 입력할 수 있습니다.';
  if (
    !original ||
    JSON.stringify(form.attachments) !== JSON.stringify(original.attachments)
  ) {
    const attachmentError = validateNoticeAttachments(form.attachments);
    if (attachmentError) return attachmentError;
  }
  if (
    (contentChanged || leavingDraft) &&
    (status !== 'draft' || !!original) &&
    !hasNoticeContent(form.content)
  )
    return '본문을 입력해 주세요.';
  if (
    status === 'scheduled' &&
    !(
      original?.status === 'scheduled' &&
      form.scheduledAt === original.scheduledAt
    ) &&
    (!form.scheduledAt ||
      !Number.isFinite(Date.parse(`${form.scheduledAt}+09:00`)) ||
      Date.parse(`${form.scheduledAt}+09:00`) <= now)
  ) {
    return '예약 일시는 현재보다 이후로 선택해 주세요.';
  }
  if (
    form.pinned &&
    form.pinned !== original?.pinned &&
    notices.filter((notice) => notice.id !== editingId && notice.pinned)
      .length >= 4
  ) {
    return '직접 고정하는 공지는 최대 4개입니다. 기존 공지의 고정을 해제해 주세요.';
  }
  return null;
}

export function formatNoticeDate(value: string) {
  if (!Number.isFinite(Date.parse(value))) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}
