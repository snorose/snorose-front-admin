import { useState } from 'react';
import {
  Label,
  Input,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui';
import type { PenaltyUserInfo } from '@/types';
import {
  WARNING_REASON_OPTIONS,
  REVOKE_WARNING_OPTIONS,
} from '@/domains/MemberInfo/constants/memberInfo';

export default function WarnPenaltyTab({
  member,
}: {
  member: PenaltyUserInfo;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formType, setFormType] = useState<'warn' | 'warnCancel' | null>(null);
  const [warnReasonType, setWarnReasonType] = useState('');
  const [warnReason, setWarnReason] = useState('');
  const [warnCount, setWarnCount] = useState(0);
  const [warnCancelType, setWarnCancelType] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelCount, setCancelCount] = useState(0);

  const resetWarnForm = () => {
    setWarnReasonType('');
    setWarnReason('');
    setWarnCount(0);
  };

  const resetCancelForm = () => {
    setWarnCancelType('');
    setCancelReason('');
    setCancelCount(0);
  };

  const handleChangeWarnReason = (value: string) => {
    setWarnReasonType(value);

    const found = WARNING_REASON_OPTIONS.find((opt) => opt.value === value);

    if (found) {
      setWarnCount(found.warnCount);
    }

    if (value === 'ETC') {
      setWarnCount(1);
    }
  };

  const handleChangeCancelReason = (value: string) => {
    setWarnCancelType(value);

    const found = REVOKE_WARNING_OPTIONS.find((opt) => opt.value === value);

    // month가 존재하는 경우 자동 설정
    if (found && typeof found.cancelCount === 'number') {
      setCancelCount(found.cancelCount);
    }

    // ETC 선택 시에는 직접 입력
    if (value === 'ETC') {
      setCancelCount(1);
    }
  };

  const validateWarnForm = () => {
    if (warnReasonType === '') {
      toast.error('경고 사유를 선택해주세요.');
      return false;
    }

    if (warnReasonType === 'ETC') {
      if (warnReason.trim() === '') {
        toast.error('상세 사유를 입력해주세요.');
        return false;
      }
      if (warnCount < 1) {
        toast.error('경고 횟수는 1 이상이어야 합니다.');
        return false;
      }
    }
    return true;
  };

  const validateCancelForm = () => {
    if (warnCancelType === '') {
      toast.error('차감 사유를 선택해주세요.');
      return false;
    }

    if (warnCancelType === 'ETC') {
      if (cancelReason.trim() === '') {
        toast.error('상세 사유를 입력해주세요.');
        return false;
      }
      if (cancelCount < 1) {
        toast.error('차감 횟수는 1 이상이어야 합니다.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (type: 'warn' | 'warnCancel') => {
    const isValid = type === 'warn' ? validateWarnForm() : validateCancelForm();
    if (!isValid) return;

    setFormType(type);
    setOpenModal(true);
  };

  const handleConfirm = () => {
    if (formType === 'warn') {
      console.log('경고 부여:', {
        member: member.studentNumber,
        reasonType: warnReasonType,
        reason: warnReason,
        count: warnCount,
        totalAfter: member.totalWarningCount + warnCount,
      });
    } else {
      console.log('경고 차감:', {
        member: member.studentNumber,
        reasonType: warnCancelType,
        reason: cancelReason,
        count: cancelCount,
        totalAfter: Math.max(0, member.totalWarningCount - cancelCount),
      });
    }

    setOpenModal(false);
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
              <SelectTrigger className='w-40 bg-white'>
                <SelectValue placeholder='경고 사유 선택' />
              </SelectTrigger>
              <SelectContent>
                {WARNING_REASON_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
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
              value={warnCount}
              onChange={(e) => setWarnCount(Number(e.target.value))}
              className='w-20 bg-white'
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={resetWarnForm}>
              초기화
            </Button>

            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={() => handleSubmit('warn')}
            >
              경고 적용
            </Button>
          </div>
        </div>
      </section>

      {/* 경고 차감하기 */}
      <section className='w-1/2 rounded-md border border-blue-300 bg-blue-50 p-4'>
        <h3 className='mb-3 font-semibold text-blue-700'>경고 차감하기</h3>

        {/* 차감 사유 선택 */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <Label className='w-24'>차감 사유</Label>
            <Select
              value={warnCancelType}
              onValueChange={(v) => handleChangeCancelReason(v)}
            >
              <SelectTrigger className='w-40 bg-white'>
                <SelectValue placeholder='차감 사유 선택' />
              </SelectTrigger>
              <SelectContent>
                {REVOKE_WARNING_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ETC - 상세 사유, 경고 차감 횟수 입력 */}
          {warnCancelType === 'ETC' && (
            <div className='flex items-center gap-2'>
              <Label className='w-24'>상세 사유</Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-40 bg-white'
                disabled={warnCancelType !== 'ETC'}
              />
            </div>
          )}
          {/* 차감 횟수 */}
          <div className='flex items-center gap-2'>
            <Label className='w-24'>차감 횟수</Label>
            <Input
              type='number'
              min={1}
              value={cancelCount}
              onChange={(e) => setCancelCount(Number(e.target.value))}
              className='w-20 bg-white'
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={resetCancelForm}>
              초기화
            </Button>

            <Button
              className='bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => handleSubmit('warnCancel')}
              disabled={member.totalWarningCount === 0}
            >
              경고 차감
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
          formType === 'warn'
            ? `${member.userName} (${member.studentNumber}) 회원에게 경고를 부여하시겠습니까?`
            : `${member.userName} (${member.studentNumber}) 회원의 경고를 차감하시겠습니까?`
        }
        description={
          formType === 'warn'
            ? `현재 경고 수: ${member.totalWarningCount} → 적용 후: ${
                member.totalWarningCount + warnCount
              }`
            : `현재 경고 수: ${member.totalWarningCount} → 차감 후: ${Math.max(
                0,
                member.totalWarningCount - cancelCount
              )}`
        }
      />
    </div>
  );
}
