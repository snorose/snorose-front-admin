import { createContext } from 'react';

import type {
  Notice,
  NoticeAttachment,
  NoticeForm,
  NoticeStatus,
} from '../types';

export const NoticesContext = createContext<{
  notices: Notice[];
  createAttachments: (files: File[]) => NoticeAttachment[];
  saveNotice: (
    form: NoticeForm,
    status: NoticeStatus,
    id?: number
  ) => string | null;
} | null>(null);
