import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/shared/hooks';
import {
  getErrorMessage,
  parseOneBasedPage,
  parseUrlParams,
} from '@/shared/utils';

import { getAdminNotices, getAllAdminNotices } from '@/apis/notices';
import { getPost } from '@/apis/posts';

import { getNoticeBoard, getNoticeBoardById } from '../constants/boards';
import { NOTICE_SCHEMA } from '../constants/notice';
import type {
  AdminNoticeListResult,
  Notice,
  NoticeAttachment,
  NoticeFilters,
  NoticeForm,
  NoticeSaveProgress,
  NoticeStatus,
} from '../types';
import { fromAdminNotice } from '../utils/api.mapper';
import { getNoticeFileType } from '../utils/attachments';
import { hasNoticeListFilters, validateNotice } from '../utils/notice';
import { saveEditedNotice, saveNewNotice } from '../utils/save-notice';

const NOTICE_QUERY_KEY = ['adminNotices'] as const;

export function useNoticeState() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const page = parseOneBasedPage(params.get('page')) - 1;
  const filters = parseUrlParams<NoticeFilters>(params, NOTICE_SCHEMA);
  const filtered = hasNoticeListFilters(filters);
  const isList = /^\/notices(?:\/general)?\/?$/.test(pathname);
  const queryPrefix = [...NOTICE_QUERY_KEY, user?.userId];
  const listQuery = useQuery({
    queryKey: [...queryPrefix, ...(filtered ? ['filtered'] : ['page', page])],
    queryFn: async (): Promise<AdminNoticeListResult> => {
      if (!filtered) return getAdminNotices(page);
      const data = await getAllAdminNotices();
      return {
        data,
        totalCount: data.length,
        totalPage: Math.ceil(data.length / 10),
        currentCount: data.length,
        hasNext: false,
      };
    },
    enabled: isList,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const notices = useMemo(
    () => (listQuery.data?.data ?? []).map((item) => fromAdminNotice(item)),
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
    pagination:
      !filtered && listQuery.data
        ? {
            totalCount: listQuery.data.totalCount,
            totalPage: listQuery.data.totalPage,
          }
        : undefined,
    isLoading: isList && listQuery.isPending,
    isError: listQuery.isError,
    retry: () => {
      void listQuery.refetch();
    },
    canSave: true,
    canEdit: true,
    loadNotice: async (id: number): Promise<Notice> => {
      const cached = queryClient.getQueriesData<AdminNoticeListResult>({
        queryKey: queryPrefix,
      });
      const cachedPage = cached
        .find(
          ([key, result]) =>
            key.at(-2) === 'page' &&
            result?.data.some((entry) => entry.postId === id)
        )?.[0]
        .at(-1);
      // 다른 화면에서 상태가 바뀔 수 있으므로 캐시는 페이지 위치만 참고합니다.
      // 수정 진입 시 해당 페이지만 새로 조회하고, 글이 이동했다면 찾을 때까지만 조회합니다.
      const fetchPage = (page: number) =>
        queryClient.fetchQuery({
          queryKey: [...queryPrefix, 'page', page],
          queryFn: () => getAdminNotices(page),
          staleTime: 0,
        });
      const firstPage = typeof cachedPage === 'number' ? cachedPage : 0;
      const firstResult = await fetchPage(firstPage);
      let totalPage = Math.max(1, firstResult.totalPage);
      let item = firstResult.data.find((entry) => entry.postId === id);
      for (let page = 0; !item && page < totalPage; page += 1) {
        if (page === firstPage) continue;
        const result = await fetchPage(page);
        totalPage = Math.max(1, result.totalPage);
        item = result.data.find((entry) => entry.postId === id);
        if (!result.hasNext) break;
      }
      if (!item) throw new Error('수정할 공지를 찾을 수 없습니다.');
      const detail = await getPost(id);
      if (!detail || detail.postId !== id || !detail.isNotice)
        throw new Error('수정할 공지를 확인할 수 없습니다.');
      const board =
        getNoticeBoard(detail.boardName) ?? getNoticeBoardById(item.boardId);
      return {
        ...fromAdminNotice(item),
        board: board?.name ?? detail.boardName,
        boardId: board?.id ?? item.boardId,
        title: detail.title,
        content: detail.content,
        category: detail.category ?? '',
        authorId: detail.encryptedUserId ?? '',
        createdAt: detail.createdAt ?? '',
        deletionStatus: detail.adminCommonStatuses?.includes('ADMIN_DELETED')
          ? 'ADMIN_DELETED'
          : detail.adminCommonStatuses?.includes('USER_DELETED')
            ? 'USER_DELETED'
            : undefined,
      };
    },
    saveNotice: async (
      form: NoticeForm,
      status: NoticeStatus,
      id?: number,
      progress: NoticeSaveProgress = {},
      original?: Notice
    ) => {
      if (id !== undefined && (!original || original.id !== id))
        return '수정할 공지를 다시 불러와 주세요.';
      if (!progress.result && !progress.updateResult) {
        const message = validateNotice(
          form,
          status,
          notices,
          id,
          Date.now(),
          original
        );
        if (message) return message;
      }
      try {
        if (original) await saveEditedNotice(original, form, status, progress);
        else await saveNewNotice(form, status, progress);
        return null;
      } catch (error) {
        return getErrorMessage(
          error,
          '공지를 저장하지 못했습니다. 다시 시도해 주세요.'
        );
      } finally {
        if (
          progress.result ||
          progress.createOutcomeUnknown ||
          progress.updateResult ||
          progress.updateOutcomeUnknown
        )
          await queryClient.invalidateQueries({
            queryKey: [...NOTICE_QUERY_KEY, user?.userId],
          });
      }
    },
    createAttachments,
    releaseAttachments,
  };
}
