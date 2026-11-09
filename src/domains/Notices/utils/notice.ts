import { NOTICE_BOARDS, NOTICE_BOARD_GROUPS } from '../constants';
import { getNoticeCategories } from '../constants/boards';
import {
  type Notice,
  type NoticeFilters,
  type NoticeForm,
  type NoticeStatus,
} from '../types';
import { validateNoticeAttachments } from './attachments';
import { hasNoticeContent, noticeContentToText } from './content';

export function getLatestNoticeId(notices: Notice[]) {
  // 목록 API의 isNew를 신뢰합니다. 수정 시각으로 NEW를 다시 판단하지 않습니다.
  return notices.find((notice) => notice.status === 'published' && notice.isNew)
    ?.id;
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
  now = Date.now()
) {
  if (!NOTICE_BOARDS.includes(form.board)) return '게시판을 선택해 주세요.';
  if (
    form.category &&
    getNoticeCategories(form.board).length > 0 &&
    !getNoticeCategories(form.board).includes(form.category)
  )
    return '카테고리를 선택해 주세요.';
  if (!form.title.trim()) return '제목을 입력해 주세요.';
  if (form.title.trim().length > 127)
    return '제목은 최대 127자까지 입력할 수 있습니다.';
  if (form.category.length > 20)
    return '카테고리는 최대 20자까지 입력할 수 있습니다.';
  const attachmentError = validateNoticeAttachments(form.attachments);
  if (attachmentError) return attachmentError;
  if (status !== 'draft' && !hasNoticeContent(form.content))
    return '본문을 입력해 주세요.';
  if (
    status === 'scheduled' &&
    (!form.scheduledAt ||
      !Number.isFinite(Date.parse(`${form.scheduledAt}+09:00`)) ||
      Date.parse(`${form.scheduledAt}+09:00`) <= now)
  ) {
    return '예약 일시는 현재보다 이후로 선택해 주세요.';
  }
  if (
    form.pinned &&
    notices.filter((notice) => notice.id !== editingId && notice.pinned)
      .length >= 4
  ) {
    return '직접 고정하는 공지는 최대 4개입니다. 기존 공지의 고정을 해제해 주세요.';
  }
  return null;
}

export function publishScheduledNotices(notices: Notice[], now = Date.now()) {
  let published = false;
  const next = notices.map((notice) => {
    const scheduledTime = Date.parse(`${notice.scheduledAt}+09:00`);
    if (
      notice.status !== 'scheduled' ||
      !Number.isFinite(scheduledTime) ||
      scheduledTime > now
    )
      return notice;
    const publishedAt = new Date(`${notice.scheduledAt}+09:00`).toISOString();
    published = true;
    return {
      ...notice,
      status: 'published' as const,
      publishedAt,
      updatedAt: publishedAt,
    };
  });
  if (!published) return next;
  const latest = next
    .filter((notice) => notice.status === 'published')
    .sort(
      (a, b) =>
        Date.parse(b.publishedAt ?? b.createdAt) -
          Date.parse(a.publishedAt ?? a.createdAt) || b.id - a.id
    )[0];
  return next.map((notice) =>
    notice.isNew === (notice.id === latest?.id)
      ? notice
      : { ...notice, isNew: notice.id === latest?.id }
  );
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
