import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { PATHS } from '@/shared/constants';
import { useDateTimeField } from '@/shared/hooks';
import { getErrorMessage } from '@/shared/utils';

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
  NoticeSaveProgress,
  NoticeStatus,
} from '../types';
import { type NoticeMediaKind, selectNoticeFiles } from '../utils/attachments';
import { hasNoticeContent, toNoticeHtml } from '../utils/content';
import { validateNotice } from '../utils/notice';
import { useNotices } from './useNotices';

export function useNoticeEditorState(notice?: Notice) {
  const navigate = useNavigate();
  const {
    notices,
    saveNotice,
    createAttachments,
    releaseAttachments,
    canSave,
    canEdit,
  } = useNotices();
  const saving = useRef(false);
  const progress = useRef<NoticeSaveProgress>({
    uploaded: new Set(),
    thumbnailReady: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<number>();
  const [createOutcomeUnknown, setCreateOutcomeUnknown] = useState(false);
  const savedStatus = useRef<NoticeStatus | null>(null);
  const writable = notice ? canEdit : canSave;
  const isFormLocked = () =>
    saving.current ||
    progress.current.result !== undefined ||
    !!progress.current.createOutcomeUnknown;
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
    onDateTimeChange: (scheduledAt) => {
      if (isFormLocked()) return;
      setForm((previous) => ({ ...previous, scheduledAt }));
    },
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
    if (saving.current || progress.current.createOutcomeUnknown) return;
    if (!writable) {
      setError('공지 작성·수정 기능은 준비 중입니다.');
      return;
    }
    if (progress.current.result) {
      setConfirmStatus(savedStatus.current);
      return;
    }
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
  const confirmSave = async () => {
    if (
      !confirmStatus ||
      saving.current ||
      progress.current.createOutcomeUnknown
    )
      return;
    const status = confirmStatus;
    savedStatus.current = status;
    saving.current = true;
    setIsSaving(true);
    setConfirmStatus(null);
    setError(null);
    try {
      const message = await saveNotice(
        form,
        status,
        notice?.id,
        progress.current
      );
      if (message) {
        setError(
          progress.current.result
            ? `공지 ${progress.current.result.postId}번은 생성되었습니다. ${message}`
            : message
        );
        return;
      }
      toast.success(`${NOTICE_STATUS_LABELS[status]} 상태로 저장했습니다.`);
      navigationAllowed.current = true;
      if (blocker.state === 'blocked') blocker.reset();
      navigate(
        status === 'published'
          ? PATHS.NOTICE_GENERAL
          : `${PATHS.NOTICE_GENERAL}?status=${status}&page=1`
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          '공지를 저장하지 못했습니다. 다시 시도해 주세요.'
        )
      );
    } finally {
      setCreatedPostId(progress.current.result?.postId);
      setCreateOutcomeUnknown(!!progress.current.createOutcomeUnknown);
      saving.current = false;
      setIsSaving(false);
    }
  };
  const attachFiles = (files: FileList | null, kind: NoticeMediaKind) => {
    if (!files || isFormLocked()) return;
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

  const updateForm = (changes: Partial<NoticeForm>) => {
    if (isFormLocked()) return;
    if (changes.attachments) {
      const remaining = new Set(
        changes.attachments.map((attachment) => attachment.id)
      );
      releaseAttachments(
        form.attachments.filter((attachment) => !remaining.has(attachment.id))
      );
    }
    setForm((previous) => ({ ...previous, ...changes }));
  };
  const handleBoardChange = (nextGroup: string, board: string) => {
    if (isFormLocked()) return;
    setGroup(nextGroup);
    setForm((previous) => ({
      ...previous,
      board,
      category: previous.board === board ? previous.category : '',
    }));
  };
  const handleCategoryChange = (category: string) => {
    if (isFormLocked()) return;
    setForm((previous) => ({
      ...previous,
      category: previous.category === category ? '' : category,
    }));
  };
  const changeMode = (nextMode: NoticeEditorMode) => {
    if (isFormLocked()) return;
    setMode(nextMode);
  };
  const requestLeave = () =>
    !saving.current &&
    (dirty ? setLeaving(true) : navigate(PATHS.NOTICE_GENERAL));
  const confirmLeave = () => {
    if (saving.current) return;
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
    setMode: changeMode,
    error,
    contentRef,
    titleRef,
    errorRef,
    imageInputRef,
    fileInputRef,
    date,
    time,
    onDateSelect: (nextDate: Date | undefined) => {
      if (!isFormLocked()) onDateSelect(nextDate);
    },
    onTimeChange: (nextTime: string) => {
      if (!isFormLocked()) onTimeChange(nextTime);
    },
    canSaveDraft,
    canSave: writable,
    isSaving,
    createdPostId,
    createOutcomeUnknown,
    formLocked: isSaving || createdPostId !== undefined || createOutcomeUnknown,
    retrySave: () => requestSave(savedStatus.current ?? mode),
    actionText,
    requestSave,
    attachFiles,
    requestLeave,
    handleBoardChange,
    handleCategoryChange,
    toggleSchedule: () =>
      changeMode(mode === 'scheduled' ? 'published' : 'scheduled'),
    dialogProps: {
      form,
      confirmStatus,
      onSave: confirmSave,
      onCloseSave: () => setConfirmStatus(null),
      isLeaving: leaving || blocker.state === 'blocked',
      isSaving,
      createdPostId,
      createOutcomeUnknown,
      onLeave: confirmLeave,
      onCloseLeave: cancelLeave,
    },
  };
}
