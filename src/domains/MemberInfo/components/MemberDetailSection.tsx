import {
  ArrowLeft,
  Check,
  Loader2,
  PencilIcon,
  UserRound,
  X,
} from 'lucide-react';

import { Button } from '@/shared/components/ui';
import type { BlacklistHistoryItem, MemberInfo } from '@/shared/types';

import MemberActivitySection from '@/domains/MemberInfo/components/MemberActivitySection';
import { SectionCard } from '@/domains/MemberInfo/components/MemberDetailCard';
import MemberDetailInfoGrid from '@/domains/MemberInfo/components/MemberDetailInfoGrid';
import MemberInfoEditForm from '@/domains/MemberInfo/components/MemberInfoEditForm';
import MemberPenaltySummaryCard from '@/domains/MemberInfo/components/MemberPenaltySummaryCard';
import MemberWithdrawalSection from '@/domains/MemberInfo/components/MemberWithdrawalSection';
import { MEMBER_INFO_EDIT_FORM_ID } from '@/domains/MemberInfo/constants/memberInfo';
import {
  formatDisplayValue,
  getRoleBadgeClassName,
} from '@/domains/MemberInfo/utils/memberDirectory';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';

type MemberDetailSectionProps = {
  isDetailLoading: boolean;
  isEdit: boolean;
  member: MemberInfo;
  latestPenaltyHistory: BlacklistHistoryItem | null;
  onBack: () => void;
  onCopy: (value: string) => void | Promise<void>;
  onEditCancel: () => void;
  onEditStart: () => void;
  onSaveEdit: (updated: MemberInfo) => void | Promise<void>;
};

export default function MemberDetailSection({
  isDetailLoading,
  isEdit,
  latestPenaltyHistory,
  member,
  onBack,
  onCopy,
  onEditCancel,
  onEditStart,
  onSaveEdit,
}: MemberDetailSectionProps) {
  const roleLabel = convertUserRoleIdToEnum(member.userRoleId);

  return (
    <article className='flex w-full flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex items-start gap-3'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={onBack}
            className='mt-1 rounded-xl'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>

          <div className='space-y-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-3xl font-bold tracking-tight text-slate-950'>
                {member.userName} ({formatDisplayValue(member.studentNumber)})
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getRoleBadgeClassName(
                  member.userRoleId
                )}`}
              >
                {roleLabel}
              </span>
            </div>
            <p className='text-sm text-slate-500'>회원 상세 정보</p>
          </div>
        </div>

        {isDetailLoading && (
          <div className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600'>
            <Loader2 className='h-4 w-4 animate-spin' />
            회원 정보를 불러오는 중입니다.
          </div>
        )}
      </div>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]'>
        <SectionCard
          icon={UserRound}
          title='회원 정보'
          action={
            !isEdit ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onEditStart}
                className='gap-2 rounded-xl'
              >
                <PencilIcon className='h-4 w-4' />
                수정
              </Button>
            ) : (
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onEditCancel}
                  className='gap-2 rounded-xl'
                >
                  <X className='h-4 w-4' />
                  취소
                </Button>
                <Button
                  type='submit'
                  size='sm'
                  form={MEMBER_INFO_EDIT_FORM_ID}
                  className='gap-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800'
                >
                  <Check className='h-4 w-4' />
                  완료
                </Button>
              </div>
            )
          }
        >
          {!isEdit ? (
            <MemberDetailInfoGrid
              member={member}
              onCopy={onCopy}
              roleLabel={roleLabel}
            />
          ) : (
            <MemberInfoEditForm
              member={member}
              onSubmit={onSaveEdit}
              onCancel={onEditCancel}
              onCopy={onCopy}
            />
          )}
        </SectionCard>

        <MemberPenaltySummaryCard
          latestPenaltyHistory={latestPenaltyHistory}
          member={member}
        />
      </div>

      <MemberActivitySection />
      <MemberWithdrawalSection />
    </article>
  );
}
