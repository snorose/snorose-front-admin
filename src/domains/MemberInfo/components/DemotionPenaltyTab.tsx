import { useMemo, useState } from 'react';

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
  BLACKLIST_DEMOTE_OPTIONS,
  RELEGATION_DEMOTE_OPTIONS,
  REVOKE_DEMOTE_OPTIONS,
} from '@/domains/MemberInfo/constants/memberInfo';

import { warnPenaltyAPI } from '@/apis';

export default function DemotionPenaltyTab({
  member,
  onApplied,
}: {
  member: PenaltyUserInfo;
  onApplied?: () => void;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formType, setFormType] = useState<'demote' | 'demoteCancel' | null>(
    null
  );

  type DemoteType = 'RELEGATION' | 'BLACKLIST' | '';
  const [demoteType, setDemoteType] = useState<DemoteType>('');
  const [demoteReasonType, setDemoteReasonType] = useState('');
  const [demoteReason, setDemoteReason] = useState('');
  const [months, setMonths] = useState(1);
  const [endDate, setEndDate] = useState('');
  const [cancelReasonType, setCancelReasonType] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidDemoteType = (value: string): value is Exclude<DemoteType, ''> =>
    value === 'RELEGATION' || value === 'BLACKLIST';

  // 종료 예정일 계산
  const calculatedEndDate = useMemo(() => {
    if (!months) return '';
    const start = new Date();
    start.setMonth(start.getMonth() + months);
    return start.toISOString().substring(0, 10);
  }, [months]);

  const resetDemoteForm = () => {
    setDemoteType('');
    setDemoteReasonType('');
    setDemoteReason('');
    setMonths(1);
  };

  const resetCancelForm = () => {
    setEndDate('');
    setCancelReasonType('');
    setCancelReason('');
  };

  const validateDemoteForm = () => {
    if (demoteType === '') {
      toast.error('강등 유형을 선택해주세요.');
      return false;
    }

    if (demoteReasonType === '') {
      toast.error('강등 사유를 선택해주세요.');
      return false;
    }

    if (demoteReasonType === 'ETC' && demoteReason.trim() === '') {
      toast.error('상세 사유를 입력해주세요.');
      return false;
    }

    if (demoteType === 'RELEGATION' && months < 1) {
      toast.error('기간(월)은 1 이상이어야 합니다.');
      return false;
    }

    return true;
  };

  const validateDemoteCancelForm = () => {
    if (endDate === '') {
      toast.error('종료 날짜를 선택해주세요.');
      return false;
    }

    if (cancelReasonType === '') {
      toast.error('해제 사유를 선택해주세요.');
      return false;
    }

    if (cancelReasonType === 'ETC' && cancelReason.trim() === '') {
      toast.error('상세 해제 사유를 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleChangeDemoteReason = (value: string) => {
    setDemoteReasonType(value);

    // 일반 강등일 때만 기간 설정
    if (demoteType === 'RELEGATION') {
      const found = RELEGATION_DEMOTE_OPTIONS.find(
        (opt) => opt.value === value
      );

      // month가 존재하는 경우 자동 설정
      if (found && typeof found.month === 'number') {
        setMonths(found.month);
      }

      // ETC 선택 시에는 직접 입력
      if (value === 'ETC') {
        setMonths(1);
      }
    }
  };

  const handleSubmit = (type: 'demote' | 'demoteCancel') => {
    const isValid =
      type === 'demote' ? validateDemoteForm() : validateDemoteCancelForm();

    if (!isValid) return;

    setFormType(type);
    setOpenModal(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    if (formType === 'demote') {
      if (!isValidDemoteType(demoteType)) {
        toast.error('강등 유형을 선택해주세요.');
        return;
      }

      const payload: AdminBlacklistReq = {
        encryptedUserId: member.encryptedUserId,
        type: demoteType,
        reason: demoteReasonType,
      };

      if (demoteReasonType === 'ETC') {
        payload.customReason = demoteReason.trim();
      }

      if (demoteType === 'RELEGATION') {
        payload.relegationMonth = months;
      }

      try {
        setIsSubmitting(true);
        await warnPenaltyAPI(payload);
        toast.success('강등 부여가 완료되었습니다.');
        resetDemoteForm();
        onApplied?.();
        setOpenModal(false);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, '강등 부여에 실패했습니다.'));
      } finally {
        setIsSubmitting(false);
      }

      return;
    } else {
      console.log('강등 해제 적용:', {
        member,
        endDate,
        cancelReasonType,
        cancelReason,
      });
    }

    setOpenModal(false);
  };

  return (
    <div className='mt-4 flex flex-row gap-8'>
      {/* 강등하기 */}
      <section className='w-1/2 rounded-md border border-red-300 bg-red-50 p-4'>
        <h3 className='mb-3 font-semibold text-red-700'>강등하기</h3>

        {/* 강등 유형 선택 */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <Label className='w-24'>강등 유형</Label>
            <Select
              value={demoteType}
              onValueChange={(v) =>
                setDemoteType(isValidDemoteType(v) ? v : '')
              }
            >
              <Select.Trigger className='w-40 bg-white'>
                <Select.Value placeholder='강등 유형 선택' />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='RELEGATION'>일반 강등</Select.Item>
                <Select.Item value='BLACKLIST'>영구 강등</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* 강등 사유 선택 */}
          <div className='flex items-center gap-2'>
            <Label className='w-24'>강등 사유</Label>
            <Select
              value={demoteReasonType}
              onValueChange={(v) => handleChangeDemoteReason(v)}
              disabled={!demoteType}
            >
              <Select.Trigger className='w-40 bg-white'>
                <Select.Value placeholder='강등 사유 선택' />
              </Select.Trigger>
              <Select.Content>
                {(demoteType === 'RELEGATION'
                  ? RELEGATION_DEMOTE_OPTIONS
                  : BLACKLIST_DEMOTE_OPTIONS
                ).map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {/* ETC 사유 입력 */}
          {demoteReasonType === 'ETC' && (
            <div className='flex items-center gap-2'>
              <Label className='w-24'>상세 사유</Label>
              <Input
                value={demoteReason}
                onChange={(e) => setDemoteReason(e.target.value)}
                className='w-40 bg-white'
                disabled={demoteReasonType !== 'ETC'}
              />
            </div>
          )}

          {/* 기간 입력 */}
          {demoteType === 'RELEGATION' && (
            <div className='flex items-center gap-2'>
              <Label className='w-24'>기간(월)</Label>
              <Input
                type='number'
                min={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className='w-24 bg-white'
              />
              <span className='text-gray-600'>
                → 종료 예정일: <b>{calculatedEndDate}</b>
              </span>
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={resetDemoteForm}>
              초기화
            </Button>

            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={() => handleSubmit('demote')}
              disabled={isSubmitting}
            >
              강등 적용
            </Button>
          </div>
        </div>
      </section>

      {/* 강등 해제하기 */}
      <section className='w-1/2 rounded-md border border-blue-300 bg-blue-50 p-4'>
        <h3 className='mb-3 font-semibold text-blue-700'>강등 해제하기</h3>

        <div className='flex flex-col gap-4'>
          {/* 종료 날짜 선택 */}
          <div className='flex items-center gap-2'>
            <Label className='w-24'>종료 날짜</Label>
            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='w-40 bg-white'
            />
          </div>

          {/* 해제 사유 선택 */}
          <div className='flex items-center gap-2'>
            <Label className='w-24'>해제 사유</Label>
            <Select
              value={cancelReasonType}
              onValueChange={setCancelReasonType}
            >
              <Select.Trigger className='w-40 bg-white'>
                <Select.Value placeholder='해제 사유 선택' />
              </Select.Trigger>
              <Select.Content>
                {REVOKE_DEMOTE_OPTIONS.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {/* ETC - 상세 사유 입력 */}
          {cancelReasonType === 'ETC' && (
            <div className='flex items-center gap-2'>
              <Label className='w-24'>상세 사유</Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-40 bg-white'
                disabled={cancelReasonType !== 'ETC'}
              />
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={resetCancelForm}>
              초기화
            </Button>

            <Button
              className='bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => handleSubmit('demoteCancel')}
              disabled={!member.isBlacklist || isSubmitting}
            >
              강등 해제
            </Button>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirm}
        confirmText='예, 진행합니다'
        closeText='아니요, 취소합니다'
        title={
          formType === 'demote'
            ? `${member.userName} (${member.studentNumber}) 회원을 강등시키겠습니까?`
            : `${member.userName} (${member.studentNumber}) 회원을 준회원(해제) 등급으로 복구하시겠습니까?`
        }
        description={
          formType === 'demote'
            ? ` 
               기간: ${months}개월 
               종료 예정일: ${calculatedEndDate}`
            : `해제 날짜: ${endDate}  `
        }
      />
    </div>
  );
}
