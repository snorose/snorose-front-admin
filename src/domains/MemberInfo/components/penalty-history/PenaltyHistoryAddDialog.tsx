import { useMemo, useState } from 'react';

import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Dialog, Textarea } from '@/shared/components/ui';
import type { AdminBlacklistReq, MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import PenaltyHistoryAddConfirmDialog from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddConfirmDialog';
import {
  DemotionFields,
  Field,
  WarningFields,
} from '@/domains/MemberInfo/components/penalty-history/PenaltyHistoryAddFields';
import {
  type AddPenaltyMode,
  DEFAULT_BLACKLIST_REASON,
  DEFAULT_RELEGATION_REASON,
  DEFAULT_WARNING_REASON,
  type DemotionType,
  MEMO_MAX_LENGTH,
  RELEGATION_REASON_OPTIONS,
  getDemotionTypeLabel,
  getReasonLabel,
  getRelegationEndDateTimeLabel,
  getWarningCountByReason,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-add-utils';
import { BLACKLIST_DEMOTE_OPTIONS } from '@/domains/MemberInfo/constants/memberInfo';

import { warnPenaltyAPI } from '@/apis';

type PenaltyHistoryAddDialogProps = {
  member: MemberInfo;
  mode: AddPenaltyMode | null;
  onApplied?: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export default function PenaltyHistoryAddDialog({
  member,
  mode,
  onApplied,
  onOpenChange,
}: PenaltyHistoryAddDialogProps) {
  const [warningReason, setWarningReason] = useState(
    DEFAULT_WARNING_REASON?.value ?? ''
  );
  const [warningCount, setWarningCount] = useState(
    DEFAULT_WARNING_REASON?.warnCount ?? 1
  );
  const [demotionType, setDemotionType] = useState<DemotionType>('RELEGATION');
  const [demotionReason, setDemotionReason] = useState(
    DEFAULT_RELEGATION_REASON?.value ?? ''
  );
  const [relegationMonth, setRelegationMonth] = useState(
    DEFAULT_RELEGATION_REASON?.month ?? 1
  );
  const [customReason, setCustomReason] = useState('');
  const [memo, setMemo] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isWarningMode = mode === 'WARNING';
  const isOpen = mode !== null;
  const selectedReason = isWarningMode ? warningReason : demotionReason;
  const needsCustomReason = selectedReason === 'ETC';
  const title = isWarningMode ? '경고 추가' : '강등 추가';
  const submitLabel = isWarningMode ? '경고 추가' : '강등 추가';
  const relegationEndDateTime = getRelegationEndDateTimeLabel(relegationMonth);

  const demotionReasonOptions = useMemo(
    () =>
      demotionType === 'RELEGATION'
        ? RELEGATION_REASON_OPTIONS
        : BLACKLIST_DEMOTE_OPTIONS,
    [demotionType]
  );

  const resetForm = () => {
    setWarningReason(DEFAULT_WARNING_REASON?.value ?? '');
    setWarningCount(DEFAULT_WARNING_REASON?.warnCount ?? 1);
    setDemotionType('RELEGATION');
    setDemotionReason(DEFAULT_RELEGATION_REASON?.value ?? '');
    setRelegationMonth(DEFAULT_RELEGATION_REASON?.month ?? 1);
    setCustomReason('');
    setMemo('');
    setIsConfirmOpen(false);
  };

  const closeDialog = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleChangeWarningReason = (value: string) => {
    setWarningReason(value);
    setWarningCount(getWarningCountByReason(value));
    setCustomReason('');
  };

  const handleChangeDemotionType = (value: string) => {
    if (value !== 'RELEGATION' && value !== 'BLACKLIST') return;

    setDemotionType(value);
    setCustomReason('');

    if (value === 'RELEGATION') {
      setDemotionReason(DEFAULT_RELEGATION_REASON?.value ?? '');
      setRelegationMonth(DEFAULT_RELEGATION_REASON?.month ?? 1);
      return;
    }

    setDemotionReason(DEFAULT_BLACKLIST_REASON?.value ?? '');
  };

  const handleChangeDemotionReason = (value: string) => {
    setDemotionReason(value);
    setCustomReason('');

    if (demotionType !== 'RELEGATION') return;

    const option = RELEGATION_REASON_OPTIONS.find(
      (item) => item.value === value
    );
    setRelegationMonth(value === 'ETC' ? 1 : (option?.month ?? 1));
  };

  const validate = () => {
    if (!mode) return false;

    if (!selectedReason) {
      toast.error(
        isWarningMode
          ? '경고 사유를 선택해주세요.'
          : '강등 사유를 선택해주세요.'
      );
      return false;
    }

    if (needsCustomReason && customReason.trim() === '') {
      toast.error('상세 사유를 입력해주세요.');
      return false;
    }

    if (isWarningMode && warningCount < 1) {
      toast.error('경고 횟수는 1 이상이어야 합니다.');
      return false;
    }

    if (
      !isWarningMode &&
      demotionType === 'RELEGATION' &&
      relegationMonth < 1
    ) {
      toast.error('강등 기간은 1개월 이상이어야 합니다.');
      return false;
    }

    return true;
  };

  const handleRequestSubmit = () => {
    if (!validate()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting || !mode) return;

    const payload = buildPayload({
      customReason,
      demotionType,
      isWarningMode,
      memo,
      member,
      needsCustomReason,
      relegationMonth,
      selectedReason,
      warningCount,
    });

    try {
      setIsSubmitting(true);
      await warnPenaltyAPI(payload);
      await onApplied?.();
      toast.success(
        `${member.userName}님에게 ${isWarningMode ? '경고' : getDemotionTypeLabel(demotionType)}이 추가되었습니다. 사유: ${getReasonLabel(selectedReason, isWarningMode, demotionType)}`
      );
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isWarningMode
            ? '경고 추가에 실패했습니다.'
            : '강등 추가에 실패했습니다.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <Dialog.Content className='rounded-2xl p-0 sm:max-w-xl'>
        <div className='space-y-8 px-8 py-8'>
          <Dialog.Header className='gap-3'>
            <Dialog.Title className='flex items-center gap-3 text-2xl font-bold text-slate-950'>
              <AlertTriangle className='h-6 w-6' />
              {title}
            </Dialog.Title>
            <Dialog.Description className='text-base font-medium text-slate-500'>
              회원에게 {isWarningMode ? '경고' : '강등'}을 추가합니다.
            </Dialog.Description>
          </Dialog.Header>

          <div className='space-y-5'>
            {isWarningMode ? (
              <WarningFields
                customReason={customReason}
                needsCustomReason={needsCustomReason}
                onCustomReasonChange={setCustomReason}
                onReasonChange={handleChangeWarningReason}
                onWarningCountChange={setWarningCount}
                reason={warningReason}
                warningCount={warningCount}
              />
            ) : (
              <DemotionFields
                customReason={customReason}
                demotionReason={demotionReason}
                demotionReasonOptions={demotionReasonOptions}
                demotionType={demotionType}
                needsCustomReason={needsCustomReason}
                onCustomReasonChange={setCustomReason}
                onDemotionReasonChange={handleChangeDemotionReason}
                onDemotionTypeChange={handleChangeDemotionType}
                onRelegationMonthChange={setRelegationMonth}
                relegationEndDateTime={relegationEndDateTime}
                relegationMonth={relegationMonth}
              />
            )}

            <Field label='메모'>
              <Textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder='관리자명: 내용'
                maxLength={MEMO_MAX_LENGTH}
                className='min-h-32 resize-none rounded-xl border-0 bg-slate-100 px-4 py-4 text-base shadow-none focus-visible:ring-slate-300'
              />
              <p className='text-right text-sm font-medium text-slate-400'>
                {memo.length}/{MEMO_MAX_LENGTH}
              </p>
            </Field>
          </div>

          <Dialog.Footer className='gap-2'>
            <Button
              type='button'
              variant='outline'
              className='h-12 rounded-xl px-6 text-base font-semibold'
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type='button'
              className='h-12 rounded-xl bg-slate-950 px-6 text-base font-bold text-white hover:bg-slate-800'
              onClick={handleRequestSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className='h-5 w-5 animate-spin' />
              ) : (
                <Plus className='h-5 w-5' />
              )}
              {submitLabel}
            </Button>
          </Dialog.Footer>
        </div>
      </Dialog.Content>

      <PenaltyHistoryAddConfirmDialog
        demotionType={demotionType}
        isSubmitting={isSubmitting}
        isWarningMode={isWarningMode}
        member={member}
        onConfirm={handleConfirmSubmit}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        relegationEndDateTime={relegationEndDateTime}
        relegationMonth={relegationMonth}
        warningCount={warningCount}
      />
    </Dialog>
  );
}

function buildPayload({
  customReason,
  demotionType,
  isWarningMode,
  memo,
  member,
  needsCustomReason,
  relegationMonth,
  selectedReason,
  warningCount,
}: {
  customReason: string;
  demotionType: DemotionType;
  isWarningMode: boolean;
  memo: string;
  member: MemberInfo;
  needsCustomReason: boolean;
  relegationMonth: number;
  selectedReason: string;
  warningCount: number;
}): AdminBlacklistReq {
  const payload: AdminBlacklistReq = {
    encryptedUserId: member.encryptedUserId,
    type: isWarningMode ? 'WARNING' : demotionType,
    reason: selectedReason,
    customReason: needsCustomReason ? customReason.trim() : null,
    memo: memo.trim() || null,
  };

  if (isWarningMode) {
    payload.warningCount = warningCount;
  }

  if (!isWarningMode && demotionType === 'RELEGATION') {
    payload.relegationMonth = relegationMonth;
  }

  return payload;
}
