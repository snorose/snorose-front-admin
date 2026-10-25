import { useState } from 'react';

import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import PenaltyHistoryAddDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddDialog';
import type { AddPenaltyMode } from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';

import { Modal } from './Modal';

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
      <Modal
        title='제재 유형 선택'
        subtitle={`${memberInfo.userName}님에게 적용할 제재 유형을 선택하세요.`}
        className='sm:max-w-xs'
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Modal.Body className='flex gap-3'>
          <Button
            type='button'
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
            type='button'
            variant='destructive-outline'
            className='flex-1'
            onClick={() => {
              onClose();
              setPenaltyMode('DEMOTION');
            }}
          >
            강등
          </Button>
        </Modal.Body>
      </Modal>

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
