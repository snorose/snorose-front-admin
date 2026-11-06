export type NoticeBoard = string;
export type NoticeStatus = 'published' | 'scheduled' | 'draft' | 'private';

export interface Notice {
  id: number;
  boardId: number;
  isNew: boolean;
  title: string;
  content: string;
  category: string;
  attachments: NoticeAttachment[];
  board: NoticeBoard;
  authorId: string;
  author: string;
  status: NoticeStatus;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledAt: string;
  views: number;
  likes: number;
  scraps: number;
}

export type NoticeForm = Pick<
  Notice,
  | 'title'
  | 'content'
  | 'board'
  | 'pinned'
  | 'scheduledAt'
  | 'category'
  | 'attachments'
>;

export interface NoticeAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  fileComment?: string;
  file?: File;
}

export interface NoticeFilters {
  startDate?: string;
  endDate?: string;
  keywordAuthor?: string;
  keyword?: string;
  scope?: string;
  sort?: string;
  group?: string;
  board?: string;
  status?: string;
  kind?: string;
  author?: string;
}

export type NoticeEditorMode = Exclude<NoticeStatus, 'draft'>;

export interface NoticeContentEditorHandle {
  focus: () => void;
}
