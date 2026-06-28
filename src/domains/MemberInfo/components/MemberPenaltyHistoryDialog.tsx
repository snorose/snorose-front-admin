import { useState } from 'react';

import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import PenaltyHistoryAddDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog';
import PenaltyHistoryDeleteDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryDeleteDialog';
import PenaltyHistoryEditConfirmDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryEditConfirmDialog';
import PenaltyHistoryEditDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryEditDialog';
import PenaltyHistoryTimelineDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog';
import type { AddPenaltyMode } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';
import { usePenaltyHistoryDialogState } from '@/domains/MemberInfo/components/penalty-history/usePenaltyHistoryDialogState';

type MemberPenaltyHistoryDialogProps = {
  hasNext: boolean;
  histories: BlacklistHistoryItem[];
  isLoading: boolean;
  member: MemberInfo;
  onChanged?: () => void | Promise<void>;
  onLoadMore: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  totalCount: number;
};

export default function MemberPenaltyHistoryDialog({
  hasNext,
  histories,
  isLoading,
  member,
  onChanged,
  onLoadMore,
  onOpenChange,
  open,
  totalCount,
}: MemberPenaltyHistoryDialogProps) {
  const {
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
  } = usePenaltyHistoryDialogState(histories);
  const [addMode, setAddMode] = useState<AddPenaltyMode | null>(null);

  return (
    <>
      <PenaltyHistoryTimelineDialog
        hasNext={hasNext}
        histories={sortedHistories}
        isLoading={isLoading}
        member={member}
        onAddDemotion={() => setAddMode('DEMOTION')}
        onAddWarning={() => setAddMode('WARNING')}
        onDelete={openDeleteDialog}
        onEdit={openEditDialog}
        onLoadMore={onLoadMore}
        onOpenChange={onOpenChange}
        open={open}
        totalCount={totalCount}
      />

      <PenaltyHistoryAddDialog
        member={member}
        mode={addMode}
        onApplied={onChanged}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setAddMode(null);
        }}
      />

      <PenaltyHistoryEditDialog
        editForm={editForm}
        editingHistory={editingHistory}
        getEditEndAt={getEditEndAt}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditingHistory(null);
        }}
        onSubmit={handleRequestSaveEdit}
        setEditForm={setEditForm}
      />

      <PenaltyHistoryEditConfirmDialog
        editForm={editForm}
        getEditEndAt={getEditEndAt}
        member={member}
        onConfirm={handleSaveEdit}
        onOpenChange={setIsEditConfirmOpen}
        open={isEditConfirmOpen}
      />

      <PenaltyHistoryDeleteDialog
        deleteReason={deleteReason}
        deletingHistory={deletingHistory}
        onConfirm={handleDeletePenalty}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeletingHistory(null);
        }}
        setDeleteReason={setDeleteReason}
      />
    </>
  );
}
