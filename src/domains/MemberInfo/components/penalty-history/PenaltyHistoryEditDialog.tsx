import type { Dispatch, SetStateAction } from 'react';

import { AlertTriangle } from 'lucide-react';

import { Button, Dialog } from '@/shared/components/ui';
import type { BlacklistHistoryItem } from '@/shared/types';

import PenaltyHistoryField from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryField';
import {
  getDefaultDurationDays,
  getDefaultReasonType,
  getReasonOptions,
  isPermanentDemotionType,
  isWarningType,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import type { PenaltyEditForm } from '@/domains/MemberInfo/components/penalty-history/usePenaltyHistoryDialogState';
import { formatDateTime } from '@/domains/MemberInfo/utils/memberDirectory';

type PenaltyHistoryEditDialogProps = {
  editForm: PenaltyEditForm;
  editingHistory: BlacklistHistoryItem | null;
  getEditEndAt: () => string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  setEditForm: Dispatch<SetStateAction<PenaltyEditForm>>;
};

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200';

export default function PenaltyHistoryEditDialog({
  editForm,
  editingHistory,
  getEditEndAt,
  onOpenChange,
  onSubmit,
  setEditForm,
}: PenaltyHistoryEditDialogProps) {
  return (
    <Dialog open={Boolean(editingHistory)} onOpenChange={onOpenChange}>
      <Dialog.Content className='rounded-2xl sm:max-w-xl'>
        <Dialog.Header>
          <Dialog.Title className='flex items-center gap-2 text-2xl'>
            <AlertTriangle className='h-6 w-6' />
            {isWarningType(editForm.type)
              ? '경고 수정'
              : `${editForm.type} 수정`}
          </Dialog.Title>
          <Dialog.Description className='text-base'>
            제재 정보를 수정할 수 있습니다.
          </Dialog.Description>
        </Dialog.Header>

        <div className='space-y-5 py-2'>
          {isWarningType(editForm.type) ? (
            <WarningFields editForm={editForm} setEditForm={setEditForm} />
          ) : (
            <DemotionFields
              editForm={editForm}
              getEditEndAt={getEditEndAt}
              setEditForm={setEditForm}
            />
          )}

          <ReasonField editForm={editForm} setEditForm={setEditForm} />

          {editForm.reasonType === 'ETC' ? (
            <PenaltyHistoryField label='상세 사유'>
              <input
                type='text'
                value={editForm.customReason}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    customReason: event.target.value,
                  }))
                }
                className={INPUT_CLASS}
              />
            </PenaltyHistoryField>
          ) : null}

          {isWarningType(editForm.type) ? (
            <PenaltyHistoryField label='경고 횟수'>
              <input
                type='number'
                min='1'
                value={editForm.warningCount}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    warningCount: event.target.value,
                  }))
                }
                className={INPUT_CLASS}
              />
            </PenaltyHistoryField>
          ) : null}

          <PenaltyHistoryField label='메모'>
            <textarea
              value={editForm.memo}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, memo: event.target.value }))
              }
              className='min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200'
            />
          </PenaltyHistoryField>
        </div>

        <Dialog.Footer>
          <Button
            type='button'
            variant='outline'
            className='rounded-xl'
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type='button'
            className='rounded-xl bg-slate-950 text-white hover:bg-slate-800'
            onClick={onSubmit}
          >
            수정 완료
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function WarningFields({
  editForm,
  setEditForm,
}: {
  editForm: PenaltyEditForm;
  setEditForm: Dispatch<SetStateAction<PenaltyEditForm>>;
}) {
  return (
    <PenaltyHistoryField label='날짜'>
      <input
        type='datetime-local'
        value={editForm.dateTime}
        onChange={(event) =>
          setEditForm((prev) => ({ ...prev, dateTime: event.target.value }))
        }
        className={INPUT_CLASS}
      />
    </PenaltyHistoryField>
  );
}

function DemotionFields({
  editForm,
  getEditEndAt,
  setEditForm,
}: {
  editForm: PenaltyEditForm;
  getEditEndAt: () => string | null;
  setEditForm: Dispatch<SetStateAction<PenaltyEditForm>>;
}) {
  return (
    <>
      <PenaltyHistoryField label='강등 종류'>
        <select
          value={editForm.type}
          onChange={(event) => {
            const nextType = event.target.value;
            const nextReasonType = getDefaultReasonType(nextType);
            setEditForm((prev) => ({
              ...prev,
              type: nextType,
              reasonType: nextReasonType,
              durationDays: getDefaultDurationDays(nextType, nextReasonType),
            }));
          }}
          className={INPUT_CLASS}
        >
          <option value='일반 강등'>일반 강등</option>
          <option value='영구 강등'>영구 강등</option>
        </select>
      </PenaltyHistoryField>

      {!isPermanentDemotionType(editForm.type) ? (
        <PenaltyHistoryField label='강등 기간 (일)'>
          <input
            type='number'
            min='1'
            value={editForm.durationDays}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                durationDays: event.target.value,
              }))
            }
            className={INPUT_CLASS}
          />
          {getEditEndAt() ? (
            <p className='pt-1 text-xs font-semibold text-slate-500'>
              {formatDateTime(getEditEndAt())} 까지 강등
            </p>
          ) : null}
        </PenaltyHistoryField>
      ) : null}
    </>
  );
}

function ReasonField({
  editForm,
  setEditForm,
}: {
  editForm: PenaltyEditForm;
  setEditForm: Dispatch<SetStateAction<PenaltyEditForm>>;
}) {
  return (
    <PenaltyHistoryField label='사유'>
      <select
        value={editForm.reasonType}
        onChange={(event) => {
          const nextReasonType = event.target.value;
          setEditForm((prev) => ({
            ...prev,
            reasonType: nextReasonType,
            durationDays: getDefaultDurationDays(prev.type, nextReasonType),
          }));
        }}
        className={INPUT_CLASS}
      >
        {getReasonOptions(editForm.type).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </PenaltyHistoryField>
  );
}
