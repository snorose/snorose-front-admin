import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/shared/hooks';

import { getNoticeBoard, getNoticeCategories } from '../constants/boards';
import {
  createMockNoticeCreateResponse,
  createSampleNotices,
} from '../mocks/notices';
import type { Notice, NoticeForm, NoticeStatus } from '../types';
import { toCreateNoticeRequest } from '../utils/api.mapper';
import { getNoticeFileType } from '../utils/attachments';
import { toNoticeHtml } from '../utils/content';
import { publishScheduledNotices, validateNotice } from '../utils/notice';

export function useNoticeMockState() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(createSampleNotices);
  const attachmentUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = attachmentUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNotices((previous) => {
        const next = publishScheduledNotices(previous);
        return next.some((notice, index) => notice !== previous[index])
          ? next
          : previous;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const saveNotice = (form: NoticeForm, status: NoticeStatus, id?: number) => {
    const error = validateNotice(form, status, notices, id);
    if (error) return error;
    const existing = notices.find((notice) => notice.id === id);
    if (id !== undefined && !existing) return '수정할 공지를 찾을 수 없습니다.';
    const now = new Date().toISOString();
    const nextId = Math.max(0, ...notices.map((notice) => notice.id)) + 1;
    // 수정 API는 제공되지 않았으므로 수정은 로컬 상태에만 적용합니다.
    const createResult =
      !existing && status !== 'private'
        ? createMockNoticeCreateResponse(
            toCreateNoticeRequest(form, status),
            nextId
          ).result
        : null;
    const newlyPublished =
      status === 'published' && existing?.status !== 'published';
    const saved: Notice = {
      id: existing?.id ?? createResult?.postId ?? nextId,
      boardId: getNoticeBoard(form.board)!.id,
      isNew:
        status === 'published' &&
        (newlyPublished || (existing?.isNew ?? false)),
      createdAt: existing?.createdAt ?? now,
      views: existing?.views ?? 0,
      likes: existing?.likes ?? 0,
      scraps: existing?.scraps ?? 0,
      ...form,
      category: getNoticeCategories(form.board).includes(form.category)
        ? form.category
        : '',
      title: form.title.trim(),
      content: toNoticeHtml(form.content),
      status,
      scheduledAt: status === 'scheduled' ? form.scheduledAt : '',
      updatedAt: now,
      publishedAt:
        status === 'published'
          ? newlyPublished
            ? now
            : (existing?.publishedAt ?? now)
          : (existing?.publishedAt ?? null),
      authorId: String(user?.userId ?? 'preview-admin'),
      author: user?.nickname ?? '관리자',
    };
    setNotices((previous) => {
      const updated = existing
        ? previous.map((notice) => (notice.id === saved.id ? saved : notice))
        : [saved, ...previous];
      return newlyPublished
        ? updated.map((notice) => ({
            ...notice,
            isNew: notice.id === saved.id,
          }))
        : updated;
    });
    return null;
  };

  return { notices, saveNotice, createAttachments };
}
