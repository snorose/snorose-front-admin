import { useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';

import type { BlacklistHistoryItem } from '@/shared/types';

import {
  addDays,
  findReasonLabel,
  findReasonType,
  formatNow,
  fromDateTimeInputValue,
  getDaysBetween,
  getPenaltyTypeLabel,
  getWarningCountFromHistory,
  isPermanentDemotionType,
  isWarningType,
  toDate,
  toDateTimeInputValue,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';

export type PenaltyEditForm = {
  type: string;
  dateTime: string;
  durationDays: string;
  reasonType: string;
  customReason: string;
  warningCount: string;
  memo: string;
};

const DEFAULT_EDIT_FORM: PenaltyEditForm = {
  type: '경고',
  dateTime: '',
  durationDays: '',
  reasonType: '',
  customReason: '',
  warningCount: '1',
  memo: '',
};

export function usePenaltyHistoryDialogState(
  histories: BlacklistHistoryItem[]
) {
  const [localHistories, setLocalHistories] = useState(histories);
  const [editingHistory, setEditingHistory] =
    useState<BlacklistHistoryItem | null>(null);
  const [deletingHistory, setDeletingHistory] =
    useState<BlacklistHistoryItem | null>(null);
  const [editForm, setEditForm] = useState<PenaltyEditForm>(DEFAULT_EDIT_FORM);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    setLocalHistories(histories);
  }, [histories]);

  const sortedHistories = useMemo(
    () =>
      [...localHistories].sort(
        (left, right) =>
          (toDate(right.createdAt)?.getTime() ?? 0) -
          (toDate(left.createdAt)?.getTime() ?? 0)
      ),
    [localHistories]
  );

  const openEditDialog = (history: BlacklistHistoryItem) => {
    const reasonType = findReasonType(history);
    setEditingHistory(history);
    setEditForm({
      type: getPenaltyTypeLabel(history.type),
      dateTime: toDateTimeInputValue(history.createdAt),
      durationDays: getDaysBetween(
        history.blacklistStartDate ?? history.createdAt,
        history.blacklistDeadline
      ),
      reasonType,
      customReason: reasonType === 'ETC' ? history.blackReason : '',
      warningCount: String(getWarningCountFromHistory(history)),
      memo: history.operatorMemo ?? '',
    });
  };

  const openDeleteDialog = (history: BlacklistHistoryItem) => {
    setDeletingHistory(history);
    setDeleteReason('');
  };

  const getEditReasonLabel = () =>
    editForm.reasonType === 'ETC'
      ? editForm.customReason.trim()
      : findReasonLabel(editForm.type, editForm.reasonType);

  const getEditStartAt = () => {
    if (isWarningType(editForm.type)) {
      return editForm.dateTime
        ? fromDateTimeInputValue(editForm.dateTime)
        : editingHistory?.createdAt;
    }

    return editingHistory?.blacklistStartDate ?? editingHistory?.createdAt;
  };

  const getEditEndAt = () => {
    const startAt = getEditStartAt();
    const durationDays = Number(editForm.durationDays);

    if (
      isWarningType(editForm.type) ||
      isPermanentDemotionType(editForm.type) ||
      !startAt ||
      !Number.isFinite(durationDays) ||
      durationDays < 1
    ) {
      return null;
    }

    return addDays(startAt, durationDays);
  };

  const validateEditForm = () => {
    if (editForm.reasonType === 'ETC' && !editForm.customReason.trim()) {
      toast.error('상세 사유를 입력해주세요.');
      return false;
    }

    if (isWarningType(editForm.type)) {
      if (!editForm.dateTime) {
        toast.error('경고 날짜를 선택해주세요.');
        return false;
      }

      if (Number(editForm.warningCount) < 1) {
        toast.error('경고 횟수는 1 이상이어야 합니다.');
        return false;
      }

      return true;
    }

    if (
      !isPermanentDemotionType(editForm.type) &&
      Number(editForm.durationDays) < 1
    ) {
      toast.error('강등 기간은 1일 이상이어야 합니다.');
      return false;
    }

    if (!editForm.memo.trim()) {
      toast.error('메모란에 수정 사유를 작성해주세요.');
      return false;
    }

    return true;
  };

  const handleRequestSaveEdit = () => {
    if (!editingHistory || !validateEditForm()) return;
    setIsEditConfirmOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingHistory) return;

    const isWarning = isWarningType(editForm.type);
    const nextStartAt = getEditStartAt();
    const nextDeadline = getEditEndAt();
    const warningCount = Math.max(1, Number(editForm.warningCount) || 1);

    setLocalHistories((prev) =>
      prev.map((history) =>
        history === editingHistory
          ? {
              ...history,
              type: isWarning ? '경고' : editForm.type,
              reasonType: editForm.reasonType,
              warningCount: isWarning ? warningCount : undefined,
              blackReason: getEditReasonLabel(),
              createdAt: isWarning
                ? (nextStartAt ?? history.createdAt)
                : history.createdAt,
              blacklistStartDate: isWarning ? null : nextStartAt,
              blacklistDeadline: nextDeadline,
              operatorMemo: editForm.memo,
            }
          : history
      )
    );
    setIsEditConfirmOpen(false);
    setEditingHistory(null);
    toast.success('mock 제재 정보가 수정되었습니다.');
  };

  const handleDeletePenalty = () => {
    if (!deletingHistory) return;
    if (!deleteReason.trim()) {
      toast.error('취소 사유를 입력해주세요.');
      return;
    }

    setLocalHistories((prev) =>
      prev.map((history) =>
        history === deletingHistory
          ? {
              ...history,
              deletedAt: formatNow(),
              deletedReason: deleteReason.trim(),
              deletedBy: 'mock_admin',
            }
          : history
      )
    );
    setDeletingHistory(null);
    toast.success('mock 제재가 취소 처리되었습니다.');
  };

  return {
    deleteReason,
    deletingHistory,
    editForm,
    editingHistory,
    getEditEndAt,
    handleDeletePenalty,
    handleRequestSaveEdit,
    handleSaveEdit,
    isEditConfirmOpen,
    openDeleteDialog,
    openEditDialog,
    setDeleteReason,
    setDeletingHistory,
    setEditForm,
    setEditingHistory,
    setIsEditConfirmOpen,
    sortedHistories,
  };
}
