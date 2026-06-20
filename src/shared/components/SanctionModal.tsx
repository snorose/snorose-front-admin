import { useState } from 'react';

import { Button, Dialog } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import PenaltyHistoryAddDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog';
import type { AddPenaltyMode } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';

interface SanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberInfo: MemberInfo | null;
}

export default function SanctionModal({
  isOpen,
  onClose,
  memberInfo,
}: SanctionModalProps) {
  const [penaltyMode, setPenaltyMode] = useState<AddPenaltyMode | null>(null);

  if (!memberInfo) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Dialog.Content className='sm:max-w-xs'>
          <Dialog.Header>
            <Dialog.Title>제재 유형 선택</Dialog.Title>
            <Dialog.Description>
              {memberInfo.userName}님에게 적용할 제재 유형을 선택하세요.
            </Dialog.Description>
          </Dialog.Header>
          <div className='flex gap-3 py-2'>
            <Button
              className='flex-1'
              variant='outline'
              onClick={() => {
                onClose();
                setPenaltyMode('WARNING');
              }}
            >
              경고
            </Button>
            <Button
              className='flex-1 bg-red-600 text-white hover:bg-red-700'
              onClick={() => {
                onClose();
                setPenaltyMode('DEMOTION');
              }}
            >
              강등
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>

      <PenaltyHistoryAddDialog
        member={memberInfo}
        mode={penaltyMode}
        onOpenChange={(open) => {
          if (!open) setPenaltyMode(null);
        }}
      />
    </>
  );
}
