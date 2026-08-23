import { useState } from 'react';

import { toast } from 'sonner';

import {
  Button,
  ConfirmModal,
  Input,
  Label,
  Select,
} from '@/shared/components/ui';
import type { AdminBlacklistReq, PenaltyUserInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import {
  getWarningCountByReason,
  isPositiveInteger,
} from '@/domains/MemberInfo/components/penalty-history/penalty-history-utils';
import { WARNING_REASON_OPTIONS } from '@/domains/MemberInfo/constants/memberInfo';
import { isPermanentDemotionPenalty } from '@/domains/MemberInfo/utils/memberDirectory';

import { warnPenaltyAPI } from '@/apis';

export default function WarnPenaltyTab({
  member,
  onApplied,
}: {
  member: PenaltyUserInfo;
  onApplied?: () => void | Promise<void>;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [warnReasonType, setWarnReasonType] = useState('');
  const [warnReason, setWarnReason] = useState('');
  const [warnCount, setWarnCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPermanentDemotion = isPermanentDemotionPenalty(member);

  const resetWarnForm = () => {
    setWarnReasonType('');
    setWarnReason('');
    setWarnCount(0);
  };

  const handleChangeWarnReason = (value: string) => {
    setWarnReasonType(value);
    setWarnCount(value === 'ETC' ? 1 : getWarningCountByReason(value));
  };

  const validateWarnForm = () => {
    if (isPermanentDemotion) {
      toast.error('영구강등 회원에게는 경고를 추가할 수 없습니다.');
      return false;
    }

    if (warnReasonType === '') {
      toast.error('경고 사유를 선택해주세요.');
      return false;
    }

    if (warnReasonType === 'ETC') {
      if (warnReason.trim() === '') {
        toast.error('상세 사유를 입력해주세요.');
        return false;
      }
      if (!isPositiveInteger(warnCount)) {
        toast.error('경고 횟수는 1 이상의 정수여야 합니다.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateWarnForm()) return;
    setOpenModal(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    const payload: AdminBlacklistReq = {
      encryptedUserId: member.encryptedUserId,
      type: 'WARNING',
      reason: warnReasonType,
      warningCount:
        warnReasonType === 'ETC'
          ? warnCount
          : getWarningCountByReason(warnReasonType),
    };

    if (warnReasonType === 'ETC') {
      payload.customReason = warnReason.trim();
    }

    try {
      setIsSubmitting(true);
      await warnPenaltyAPI(payload);
      toast.success('경고 부여가 완료되었습니다.');
      resetWarnForm();
      await onApplied?.();
      setOpenModal(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '경고 부여에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mt-4 flex flex-row gap-8'>
      {/* 경고하기 */}
      <section className='w-1/2 rounded-md border border-red-300 bg-red-50 p-4'>
        <h3 className='mb-3 font-semibold text-red-700'>경고하기</h3>

        {/* 경고 사유 선택 */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <Label className='w-24'>경고 사유</Label>
            <Select
              value={warnReasonType}
              onValueChange={(v) => handleChangeWarnReason(v)}
            >
              <Select.Trigger className='w-40 bg-white'>
                <Select.Value placeholder='경고 사유 선택' />
              </Select.Trigger>
              <Select.Content>
                {WARNING_REASON_OPTIONS.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {/* ETC - 상세 사유, 경고 횟수 입력 */}
          {warnReasonType === 'ETC' && (
            <div className='flex items-center gap-2'>
              <Label className='w-24'>상세 사유</Label>
              <Input
                value={warnReason}
                onChange={(e) => setWarnReason(e.target.value)}
                className='w-40 bg-white'
                disabled={warnReasonType !== 'ETC'}
              />
            </div>
          )}
          <div className='flex items-center gap-2'>
            <Label className='w-24'>적용 경고 횟수</Label>
            <Input
              type='number'
              min={1}
              step={1}
              value={warnCount}
              onChange={(e) => setWarnCount(Number(e.target.value))}
              disabled={warnReasonType !== 'ETC'}
              className='w-20 bg-white disabled:cursor-not-allowed disabled:bg-gray-100'
            />
          </div>
          {warnReasonType && warnReasonType !== 'ETC' ? (
            <p className='text-sm text-gray-500'>
              선택한 사유의 기본 경고 횟수가 적용됩니다.
            </p>
          ) : null}

          {isPermanentDemotion ? (
            <p className='text-sm font-medium text-red-600'>
              영구강등 회원에게는 경고를 추가할 수 없습니다.
            </p>
          ) : null}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={resetWarnForm}>
              초기화
            </Button>

            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={handleSubmit}
              disabled={isSubmitting || isPermanentDemotion}
            >
              경고 적용
            </Button>
          </div>
        </div>
      </section>

      {/* 경고 차감하기 */}
      <section className='w-1/2 rounded-md border border-blue-300 bg-blue-50 p-4'>
        <h3 className='mb-3 font-semibold text-blue-700'>경고 차감하기</h3>
        <div className='rounded-md border border-blue-200 bg-white/70 p-4 text-sm font-medium text-blue-700'>
          경고 차감 API가 준비되지 않았습니다. 차감이 필요한 경우 담당자에게
          요청해주세요.
        </div>
      </section>

      <ConfirmModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirm}
        confirmText='예, 진행합니다'
        closeText='아니요, 취소합니다'
        title={`${member.userName} (${member.studentNumber}) 회원에게 경고를 부여하시겠습니까?`}
        description={`현재 경고 수: ${member.totalWarningCount} → 적용 후: ${
          member.totalWarningCount + warnCount
        }`}
      />
    </div>
  );
}
