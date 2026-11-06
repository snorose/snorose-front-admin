import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { PATHS } from '@/shared/constants';
import { useDateTimeField } from '@/shared/hooks';

import {
  NOTICE_BOARD_GROUPS,
  NOTICE_STATUS_LABELS,
  getNoticeCategories,
} from '../constants';
import type {
  Notice,
  NoticeContentEditorHandle,
  NoticeEditorMode,
  NoticeForm,
  NoticeStatus,
} from '../types';
import { type NoticeMediaKind, selectNoticeFiles } from '../utils/attachments';
import { hasNoticeContent, toNoticeHtml } from '../utils/content';
import { validateNotice } from '../utils/notice';
import { useNotices } from './useNotices';

export function useNoticeEditorState(notice?: Notice) {
  const navigate = useNavigate();
  const { notices, saveNotice, createAttachments } = useNotices();
  const [initialForm] = useState<NoticeForm>(() => ({
    title: notice?.title ?? '',
    content: toNoticeHtml(notice?.content ?? ''),
    board: notice?.board ?? '',
    pinned: notice?.pinned ?? false,
    scheduledAt: notice?.scheduledAt ?? '',
    category: getNoticeCategories(notice?.board ?? '').includes(
      notice?.category ?? ''
    )
      ? (notice?.category ?? '')
      : '',
    attachments: notice?.attachments ?? [],
  }));
  const [form, setForm] = useState(initialForm);
  const categories = getNoticeCategories(form.board);
  const [group, setGroup] = useState(
    () =>
      NOTICE_BOARD_GROUPS.find((item) =>
        item.boards.includes(initialForm.board)
      )?.label ?? ''
  );
  const [mode, setMode] = useState<NoticeEditorMode>(
    notice?.status === 'scheduled'
      ? 'scheduled'
      : notice?.status === 'private'
        ? 'private'
        : 'published'
  );
  const [initialMode] = useState(mode);
  const [error, setError] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<NoticeStatus | null>(null);
  const [leaving, setLeaving] = useState(false);
  const contentRef = useRef<NoticeContentEditorHandle>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { date, time, onDateSelect, onTimeChange } = useDateTimeField({
    initialDateTime: initialForm.scheduledAt,
    onDateTimeChange: (scheduledAt) =>
      setForm((previous) => ({ ...previous, scheduledAt })),
  });
  const dirty =
    JSON.stringify(form) !== JSON.stringify(initialForm) ||
    mode !== initialMode;
  const navigationAllowed = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !navigationAllowed.current &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search)
  );
  const canSaveDraft = !notice || notice.status === 'draft';
  const actionText =
    mode === 'scheduled'
      ? '예약 게시'
      : mode === 'private'
        ? '비공개로 저장'
        : notice?.status === 'published'
          ? '수정사항 반영'
          : '게시';

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (navigationAllowed.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [dirty]);

  const requestSave = (status: NoticeStatus) => {
    const message = validateNotice(form, status, notices, notice?.id);
    setError(message);
    if (message) {
      if (!form.board) requestAnimationFrame(() => errorRef.current?.focus());
      else if (!form.title.trim()) titleRef.current?.focus();
      else if (status !== 'draft' && !hasNoticeContent(form.content))
        contentRef.current?.focus();
      else requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setConfirmStatus(status);
  };
  const confirmSave = () => {
    if (!confirmStatus) return;
    const message = saveNotice(form, confirmStatus, notice?.id);
    setConfirmStatus(null);
    if (message) {
      setError(message);
      return;
    }
    toast.success(
      `${NOTICE_STATUS_LABELS[confirmStatus]} 상태로 저장했습니다. (미리보기)`
    );
    navigationAllowed.current = true;
    navigate(PATHS.NOTICE_GENERAL);
  };
  const attachFiles = (files: FileList | null, kind: NoticeMediaKind) => {
    if (!files) return;
    const selected = selectNoticeFiles(
      Array.from(files),
      form.attachments,
      kind
    );
    setError(selected.error);
    if (selected.files.length === 0) return;
    const attachments = createAttachments(selected.files);
    setForm((previous) => ({
      ...previous,
      attachments: [...previous.attachments, ...attachments],
    }));
  };

  const updateForm = (changes: Partial<NoticeForm>) =>
    setForm((previous) => ({ ...previous, ...changes }));
  const handleBoardChange = (nextGroup: string, board: string) => {
    setGroup(nextGroup);
    setForm((previous) => ({
      ...previous,
      board,
      category: previous.board === board ? previous.category : '',
    }));
  };
  const handleCategoryChange = (category: string) =>
    setForm((previous) => ({
      ...previous,
      category: previous.category === category ? '' : category,
    }));
  const requestLeave = () =>
    dirty ? setLeaving(true) : navigate(PATHS.NOTICE_GENERAL);
  const confirmLeave = () => {
    navigationAllowed.current = true;
    if (blocker.state === 'blocked') blocker.proceed();
    else navigate(PATHS.NOTICE_GENERAL);
  };
  const cancelLeave = () => {
    setLeaving(false);
    if (blocker.state === 'blocked') blocker.reset();
  };
  return {
    form,
    updateForm,
    group,
    categories,
    mode,
    setMode,
    error,
    contentRef,
    titleRef,
    errorRef,
    imageInputRef,
    fileInputRef,
    date,
    time,
    onDateSelect,
    onTimeChange,
    canSaveDraft,
    actionText,
    requestSave,
    attachFiles,
    requestLeave,
    handleBoardChange,
    handleCategoryChange,
    toggleSchedule: () =>
      setMode(mode === 'scheduled' ? 'published' : 'scheduled'),
    dialogProps: {
      form,
      confirmStatus,
      onSave: confirmSave,
      onCloseSave: () => setConfirmStatus(null),
      isLeaving: leaving || blocker.state === 'blocked',
      onLeave: confirmLeave,
      onCloseLeave: cancelLeave,
    },
  };
}
