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
import { fromAdminNoticeStatus } from '../utils/api.mapper';
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
  const progress = useRef<NoticeSaveProgress>({});
  const [isSaving, setIsSaving] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<number>();
  const [createOutcomeUnknown, setCreateOutcomeUnknown] = useState(false);
  const isDeleted = !!notice?.deletionStatus;
  const writable = !isDeleted && (notice ? canEdit : canSave);
  const isFormLocked = () =>
    isDeleted ||
    saving.current ||
    progress.current.result !== undefined ||
    progress.current.updateResult !== undefined ||
    !!progress.current.createOutcomeUnknown ||
    !!progress.current.updateOutcomeUnknown;
  const [initialForm] = useState<NoticeForm>(() => ({
    title: notice?.title ?? '',
    content: toNoticeHtml(notice?.content ?? ''),
    board: notice?.board ?? '',
    pinned: notice?.pinned ?? false,
    scheduledAt: notice?.scheduledAt ?? '',
    category: notice?.category ?? '',
    attachments: notice?.attachments ?? [],
  }));
  const [form, setForm] = useState(initialForm);
  const boardCategories = getNoticeCategories(form.board);
  const categories =
    boardCategories.length > 0 &&
    form.category &&
    !boardCategories.includes(form.category)
      ? [...boardCategories, form.category]
      : boardCategories;
  const attachmentsUnavailable = notice?.attachmentsKnown === false;
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
  const scheduleUnknown = notice?.status === 'scheduled' && !notice.scheduledAt;
  const [rescheduleRequested, setRescheduleRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<NoticeStatus | null>(null);
  const [leaving, setLeaving] = useState(false);
  const contentRef = useRef<NoticeContentEditorHandle>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { date, time, onDateSelect, onTimeChange, setDateTime } =
    useDateTimeField({
      initialDateTime: initialForm.scheduledAt,
      onDateTimeChange: (scheduledAt) => {
        if (isFormLocked()) return;
        setForm((previous) => ({ ...previous, scheduledAt }));
      },
    });
  const dirty =
    JSON.stringify(form) !== JSON.stringify(initialForm) ||
    mode !== initialMode ||
    rescheduleRequested;
  const navigationAllowed = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !navigationAllowed.current &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search)
  );
  const canSaveDraft = !notice || notice.status === 'draft';
  const canSchedule =
    !notice || notice.status === 'draft' || notice.status === 'scheduled';
  const visibilityAction =
    notice && notice.status !== 'draft'
      ? notice.status === 'private'
        ? ('public' as const)
        : ('private' as const)
      : undefined;
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
    if (isFormLocked()) return;
    if (!writable) {
      setError('공지 작성·수정 기능은 준비 중입니다.');
      return;
    }
    if (status === 'scheduled' && !canSchedule) {
      setError(
        '이미 게시되었거나 비공개인 공지는 예약 상태로 변경할 수 없습니다.'
      );
      return;
    }
    if (notice && status === notice.status && !dirty) {
      setError('변경사항이 없습니다.');
      return;
    }
    if (
      status === 'scheduled' &&
      scheduleUnknown &&
      rescheduleRequested &&
      !form.scheduledAt
    ) {
      setError('예약 시각을 변경하려면 날짜와 시간을 선택해 주세요.');
      return;
    }
    const message = validateNotice(
      form,
      status,
      notices,
      notice?.id,
      Date.now(),
      notice
    );
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
    if (!confirmStatus || isFormLocked()) return;
    const status = confirmStatus;
    saving.current = true;
    setIsSaving(true);
    setConfirmStatus(null);
    setError(null);
    try {
      const message = await saveNotice(
        form,
        status,
        notice?.id,
        progress.current,
        notice
      );
      if (message) {
        const errorMessage = progress.current.updateResult
          ? `공지 ${progress.current.updateResult.postId}번은 수정되었습니다. ${message}`
          : progress.current.result
            ? `공지 ${progress.current.result.postId}번은 생성되었습니다. ${message}`
            : message;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      const finalStatus = progress.current.updateResult
        ? fromAdminNoticeStatus(progress.current.updateResult.status)
        : status;
      toast.success(
        `${NOTICE_STATUS_LABELS[finalStatus]} 상태로 저장했습니다.`
      );
      navigationAllowed.current = true;
      if (blocker.state === 'blocked') blocker.reset();
      navigate(
        finalStatus === 'published'
          ? PATHS.NOTICE_GENERAL
          : `${PATHS.NOTICE_GENERAL}?status=${finalStatus}&page=1`
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        '공지를 저장하지 못했습니다. 다시 시도해 주세요.'
      );
      setError(message);
      toast.error(message);
    } finally {
      setCreatedPostId(
        progress.current.result?.postId ?? progress.current.updateResult?.postId
      );
      setCreateOutcomeUnknown(
        !!progress.current.createOutcomeUnknown ||
          !!progress.current.updateOutcomeUnknown
      );
      saving.current = false;
      setIsSaving(false);
    }
  };
  const attachFiles = (files: FileList | null, kind: NoticeMediaKind) => {
    if (!files || isFormLocked() || attachmentsUnavailable) return;
    const selected = selectNoticeFiles(
      Array.from(files),
      form.attachments,
      kind
    );
    setError(selected.error);
    if (selected.error) toast.error(selected.error);
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
      if (attachmentsUnavailable) return;
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
    if (isFormLocked() || (nextMode === 'scheduled' && !canSchedule)) return;
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
    canSchedule,
    visibilityAction,
    changeVisibility: () =>
      requestSave(visibilityAction === 'public' ? 'published' : 'private'),
    canSave: writable,
    isSaving,
    createdPostId,
    createOutcomeUnknown,
    formLocked:
      isDeleted ||
      isSaving ||
      createdPostId !== undefined ||
      createOutcomeUnknown,
    attachmentsUnavailable,
    preserveSchedule: scheduleUnknown && !rescheduleRequested,
    scheduleUnknown,
    changeSchedule: () => {
      if (!isFormLocked()) setRescheduleRequested(true);
    },
    keepSchedule: () => {
      if (isFormLocked()) return;
      setRescheduleRequested(false);
      setDateTime('');
      setForm((previous) => ({ ...previous, scheduledAt: '' }));
    },
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
      originalStatus: notice?.status,
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
