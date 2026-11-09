import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/shared/hooks';
import { getErrorMessage } from '@/shared/utils';

import { getAllAdminNotices } from '@/apis/notices';

import type {
  NoticeAttachment,
  NoticeForm,
  NoticeSaveProgress,
  NoticeStatus,
} from '../types';
import { fromAdminNotice } from '../utils/api.mapper';
import { getNoticeFileType } from '../utils/attachments';
import { validateNotice } from '../utils/notice';
import { saveNewNotice } from '../utils/save-notice';

const NOTICE_QUERY_KEY = ['adminNotices'] as const;

export function useNoticeState() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const listQuery = useQuery({
    queryKey: [...NOTICE_QUERY_KEY, user?.userId],
    queryFn: getAllAdminNotices,
    enabled: pathname === '/notices' || pathname.startsWith('/notices/'),
  });
  const notices = useMemo(
    () => (listQuery.data ?? []).map((item) => fromAdminNotice(item)),
    [listQuery.data]
  );
  const attachmentUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = attachmentUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
    // Provider는 다른 관리 화면에서도 유지되므로 작성 화면을 나갈 때 미리보기를 해제합니다.
  }, [pathname]);
  const releaseAttachments = (attachments: NoticeAttachment[]) => {
    for (const attachment of attachments) {
      if (!attachmentUrls.current.delete(attachment.url)) continue;
      URL.revokeObjectURL(attachment.url);
    }
  };
  const createAttachments = (files: File[]) =>
    files.map((file) => {
      const url = URL.createObjectURL(file);
      attachmentUrls.current.add(url);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: getNoticeFileType(file)!,
        url,
        file,
      };
    });

  return {
    notices,
    isLoading: listQuery.isPending,
    isError: listQuery.isError,
    retry: () => {
      void listQuery.refetch();
    },
    canSave: true,
    canEdit: false,
    saveNotice: async (
      form: NoticeForm,
      status: NoticeStatus,
      id?: number,
      progress: NoticeSaveProgress = {
        uploaded: new Set(),
        thumbnailReady: false,
      }
    ) => {
      if (id !== undefined) return '공지 수정 기능은 준비 중입니다.';
      if (!progress.result) {
        const message = validateNotice(form, status, notices);
        if (message) return message;
      }
      try {
        await saveNewNotice(form, status, progress);
        return null;
      } catch (error) {
        return getErrorMessage(
          error,
          '공지를 저장하지 못했습니다. 다시 시도해 주세요.'
        );
      } finally {
        if (progress.result || progress.createOutcomeUnknown)
          await queryClient.invalidateQueries({
            queryKey: [...NOTICE_QUERY_KEY, user?.userId],
          });
      }
    },
    createAttachments,
    releaseAttachments,
  };
}
