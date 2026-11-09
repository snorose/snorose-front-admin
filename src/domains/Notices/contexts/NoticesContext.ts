import { createContext } from 'react';

import type {
  Notice,
  NoticeAttachment,
  NoticeForm,
  NoticeSaveProgress,
  NoticeStatus,
} from '../types';

export const NoticesContext = createContext<{
  notices: Notice[];
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  canSave: boolean;
  canEdit: boolean;
  createAttachments: (files: File[]) => NoticeAttachment[];
  releaseAttachments: (attachments: NoticeAttachment[]) => void;
  saveNotice: (
    form: NoticeForm,
    status: NoticeStatus,
    id?: number,
    progress?: NoticeSaveProgress
  ) => string | null | Promise<string | null>;
} | null>(null);
