import type { NoticeStatus } from '../types';

export const NOTICE_STATUS_LABELS: Record<NoticeStatus, string> = {
  published: '게시',
  scheduled: '예약',
  draft: '임시저장',
  private: '비공개',
};

export const NOTICE_STATUS_TONES = {
  published: 'success',
  scheduled: 'info',
  draft: 'warning',
  private: 'neutral',
} as const;
export const NOTICE_ROW_TONES = {
  published: '',
  scheduled: 'bg-blue-50/20',
  draft: 'bg-amber-50/40',
  private: 'bg-gray-50',
};
export const NOTICE_SCHEMA = {
  startDate: 'string',
  endDate: 'string',
  keywordAuthor: 'string',
  keyword: 'string',
  scope: 'string',
  sort: 'string',
  group: 'string',
  board: 'string',
  status: 'string',
  kind: 'string',
  author: 'string',
} as const;
