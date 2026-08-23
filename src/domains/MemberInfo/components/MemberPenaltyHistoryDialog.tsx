import { useMemo, useState } from 'react';

import { toast } from 'sonner';

import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import PenaltyHistoryAddDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog';
import PenaltyHistoryTimelineDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryTimelineDialog';
import type { AddPenaltyMode } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';
import { toDate } from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import { isPermanentDemotionPenalty } from '@/domains/MemberInfo/utils/memberDirectory';

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
  const [addMode, setAddMode] = useState<AddPenaltyMode | null>(null);
  const sortedHistories = useMemo(
    () =>
      [...histories].sort(
        (left, right) =>
          (toDate(right.createdAt)?.getTime() ?? 0) -
          (toDate(left.createdAt)?.getTime() ?? 0)
      ),
    [histories]
  );

  return (
    <>
      <PenaltyHistoryTimelineDialog
        canAddWarning={!isPermanentDemotionPenalty(member)}
        hasNext={hasNext}
        histories={sortedHistories}
        isLoading={isLoading}
        member={member}
        onAddDemotion={() => setAddMode('DEMOTION')}
        onAddWarning={() => setAddMode('WARNING')}
        onDelete={() => toast.info('제재 삭제는 담당자에게 요청해주세요.')}
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
    </>
  );
}
