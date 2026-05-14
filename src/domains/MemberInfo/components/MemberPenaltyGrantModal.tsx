import { useMemo, useState } from 'react';

import { AlertTriangle, X } from 'lucide-react';

import {
  Button,
  Dialog,
  Input,
  Select,
  Textarea,
} from '@/shared/components/ui';
import type { AdminUserListItem } from '@/shared/types';

type PenaltyType = 'WARNING' | 'TEMPORARY_DEMOTION' | 'PERMANENT_DEMOTION';

type MemberPenaltyGrantModalProps = {
  open: boolean;
  selectedMembers: AdminUserListItem[];
  onOpenChange: (open: boolean) => void;
  onRemoveMember: (encryptedUserId: string) => void;
};

const PENALTY_TYPES: { label: string; value: PenaltyType }[] = [
  { label: '경고', value: 'WARNING' },
  { label: '일반강등', value: 'TEMPORARY_DEMOTION' },
  { label: '영구강등', value: 'PERMANENT_DEMOTION' },
];

const PENALTY_REASONS = [
  '부적절한 게시글 작성',
  '부적절한 언어 사용',
  '다른 회원 비방',
  '스팸 게시글 작성',
  '반복적인 규칙 위반',
  '중대한 커뮤니티 규칙 위반',
  '기타',
];

export default function MemberPenaltyGrantModal({
  open,
  selectedMembers,
  onOpenChange,
  onRemoveMember,
}: MemberPenaltyGrantModalProps) {
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('WARNING');
  const [reason, setReason] = useState(PENALTY_REASONS[0]);
  const [memo, setMemo] = useState('');
  const [demotionDays, setDemotionDays] = useState('30');
  const selectedCount = selectedMembers.length;
  const shouldShowDuration = penaltyType === 'TEMPORARY_DEMOTION';
  const penaltyTypeLabel = useMemo(
    () =>
      PENALTY_TYPES.find((option) => option.value === penaltyType)?.label ??
      '경고',
    [penaltyType]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className='max-h-[calc(100vh-3rem)] w-[512px] overflow-y-auto rounded-xl border-slate-200 bg-white p-6 shadow-xl sm:max-w-[512px]'>
        <Dialog.Header className='gap-2'>
          <Dialog.Title className='flex items-center gap-2 text-base font-bold text-slate-950'>
            <AlertTriangle className='h-5 w-5 text-slate-950' />
            일괄 제재 부여
          </Dialog.Title>
          <Dialog.Description className='text-sm text-slate-500'>
            선택한 {selectedCount}명의 회원에게 제재를 부여합니다.
          </Dialog.Description>
        </Dialog.Header>

        <div className='space-y-4'>
          <section className='space-y-2'>
            <h3 className='text-sm font-semibold text-slate-950'>
              선택된 회원 ({selectedCount}명)
            </h3>
            <div className='flex min-h-[94px] flex-wrap content-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3'>
              {selectedMembers.map((member) => (
                <span
                  key={member.encryptedUserId}
                  className='inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 shadow-xs'
                >
                  {member.userName} ({member.loginId})
                  <button
                    type='button'
                    aria-label={`${member.userName} 선택 해제`}
                    onClick={() => onRemoveMember(member.encryptedUserId)}
                    className='rounded-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </span>
              ))}
            </div>
          </section>

          <label className='space-y-2'>
            <span className='text-sm font-semibold text-slate-950'>
              제재 종류
            </span>
            <Select
              value={penaltyType}
              onValueChange={(value) => setPenaltyType(value as PenaltyType)}
            >
              <Select.Trigger className='h-10 w-full rounded-lg border-0 bg-slate-100 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-slate-300'>
                <Select.Value placeholder={penaltyTypeLabel} />
              </Select.Trigger>
              <Select.Content
                align='start'
                className='z-[70] rounded-lg border-slate-200 p-1 shadow-lg'
              >
                {PENALTY_TYPES.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className='h-8 rounded-md text-sm'
                  >
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </label>

          {shouldShowDuration && (
            <label className='space-y-2'>
              <span className='text-sm font-semibold text-slate-950'>
                강등 기간 (일)
              </span>
              <Input
                type='number'
                min={1}
                value={demotionDays}
                onChange={(event) => setDemotionDays(event.target.value)}
                className='h-10 rounded-lg border-0 bg-slate-100 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-slate-300'
              />
            </label>
          )}

          <label className='space-y-2'>
            <span className='text-sm font-semibold text-slate-950'>사유</span>
            <Select value={reason} onValueChange={setReason}>
              <Select.Trigger className='h-10 w-full rounded-lg border-0 bg-slate-100 px-3 shadow-none focus-visible:ring-2 focus-visible:ring-slate-300'>
                <Select.Value placeholder={reason} />
              </Select.Trigger>
              <Select.Content
                align='start'
                className='z-[70] rounded-lg border-slate-200 p-1 shadow-lg'
              >
                {PENALTY_REASONS.map((option) => (
                  <Select.Item
                    key={option}
                    value={option}
                    className='h-8 rounded-md text-sm'
                  >
                    {option}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </label>

          <label className='space-y-2'>
            <span className='text-sm font-semibold text-slate-950'>메모</span>
            <Textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder='메모를 입력하세요'
              className='min-h-20 resize-none rounded-lg border-0 bg-slate-100 px-3 py-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-slate-300'
            />
          </label>
        </div>

        <Dialog.Footer className='mt-0 flex-row justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-lg border-slate-200 px-4 text-slate-950'
          >
            취소
          </Button>
          <Button
            type='button'
            onClick={() => onOpenChange(false)}
            disabled={selectedCount === 0}
            className='h-9 rounded-lg bg-rose-600 px-4 text-white hover:bg-rose-700'
          >
            <AlertTriangle className='h-4 w-4' />
            제재 부여
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
