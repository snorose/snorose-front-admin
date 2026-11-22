import { createContext } from 'react';

import type {
  AdminNoticeListResult,
  Notice,
  NoticeAttachment,
  NoticeForm,
  NoticeSaveProgress,
  NoticeStatus,
} from '../types';

export const NoticesContext = createContext<{
  notices: Notice[];
  pagination?: Pick<AdminNoticeListResult, 'totalCount' | 'totalPage'>;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  canSave: boolean;
  canEdit: boolean;
  loadNotice?: (id: number) => Promise<Notice>;
  createAttachments: (files: File[]) => NoticeAttachment[];
  releaseAttachments: (attachments: NoticeAttachment[]) => void;
  saveNotice: (
    form: NoticeForm,
    status: NoticeStatus,
    id?: number,
    progress?: NoticeSaveProgress,
    original?: Notice
  ) => string | null | Promise<string | null>;
} | null>(null);
