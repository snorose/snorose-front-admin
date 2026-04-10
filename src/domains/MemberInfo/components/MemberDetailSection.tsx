import type { ReactNode } from 'react';

import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Loader2,
  type LucideIcon,
  MessageSquare,
  PencilIcon,
  ShieldAlert,
  TriangleAlert,
  UserRound,
} from 'lucide-react';

import { Button } from '@/shared/components/ui';
import type { MemberInfo } from '@/shared/types';

import MemberDetailInfoGrid from '@/domains/MemberInfo/components/MemberDetailInfoGrid';
import MemberInfoEditForm from '@/domains/MemberInfo/components/MemberInfoEditForm';
import {
  formatDate,
  formatDisplayValue,
  getPenaltyStatus,
  getRoleBadgeClassName,
} from '@/domains/MemberInfo/utils/memberDirectory';
import { convertUserRoleIdToEnum } from '@/domains/MemberInfo/utils/memberInfoFormatters';

type MemberDetailSectionProps = {
  isDetailLoading: boolean;
  isEdit: boolean;
  member: MemberInfo;
  onBack: () => void;
  onCopy: (value: string) => void | Promise<void>;
  onEditCancel: () => void;
  onEditStart: () => void;
  onSaveEdit: (updated: MemberInfo) => void | Promise<void>;
};

type DetailShortcut = {
  description: string;
  icon: LucideIcon;
  title: string;
};

const DETAIL_SHORTCUTS: DetailShortcut[] = [
  {
    title: '작성한 게시글 조회',
    description: '회원별 게시글 이력 API 연동 후 제공됩니다.',
    icon: FileText,
  },
  {
    title: '작성한 댓글 조회',
    description: '회원별 댓글 이력 API 연동 후 제공됩니다.',
    icon: MessageSquare,
  },
  {
    title: '다운로드 받은 시험후기',
    description: '다운로드 이력 API 연동 후 제공됩니다.',
    icon: Download,
  },
  {
    title: '문의/신고 접수 조회',
    description: '문의/신고 이력 API 연동 후 제공됩니다.',
    icon: ShieldAlert,
  },
  {
    title: '회원 활동 요약',
    description: '추가 활동 지표 API 연동 시 이 영역에 표시됩니다.',
    icon: BookOpen,
  },
];

const WITHDRAWAL_WARNINGS = [
  '회원의 모든 데이터가 영구적으로 삭제됩니다.',
  '작성한 게시글, 댓글, 시험후기 등이 함께 삭제될 수 있습니다.',
  '보유 포인트가 모두 소멸됩니다.',
  '이 작업은 되돌릴 수 없습니다.',
];

export default function MemberDetailSection({
  isDetailLoading,
  isEdit,
  member,
  onBack,
  onCopy,
  onEditCancel,
  onEditStart,
  onSaveEdit,
}: MemberDetailSectionProps) {
  const penaltyStatus = getPenaltyStatus(member);
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
            ) : null
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
            />
          )}
        </SectionCard>

        <SectionCard icon={ShieldAlert} title='제재 상태 요약'>
          <div className='space-y-6'>
            <div className='space-y-3'>
              <p className='text-sm font-medium text-slate-500'>현재 상태</p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${penaltyStatus.tone}`}
              >
                {penaltyStatus.label}
              </span>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-500'>누적 경고 수</p>
              <p className='text-3xl font-bold text-slate-950'>
                {member.totalWarningCount}
                <span className='ml-1 text-lg font-semibold text-slate-500'>
                  회
                </span>
              </p>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-500'>제재 기간</p>
              <p className='text-sm font-semibold text-slate-900'>
                {member.blacklistStartDate || member.blacklistEndDate
                  ? `${formatDate(member.blacklistStartDate)} ~ ${formatDate(
                      member.blacklistEndDate
                    )}`
                  : '적용된 제재 기간이 없습니다.'}
              </p>
            </div>

            <div
              className={`rounded-2xl px-4 py-5 text-sm font-medium ${
                member.isBlacklist
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {penaltyStatus.summary}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={BookOpen} title='회원 활동 내역'>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {DETAIL_SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut.title}
              type='button'
              disabled
              className='flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center transition disabled:cursor-not-allowed disabled:opacity-100'
            >
              <shortcut.icon className='h-8 w-8 text-slate-800' />
              <div className='space-y-1'>
                <p className='font-semibold text-slate-900'>{shortcut.title}</p>
                <p className='text-sm text-slate-500'>{shortcut.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <section className='rounded-3xl border border-rose-200 bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-2 text-lg font-semibold text-rose-600'>
          <TriangleAlert className='h-5 w-5' />
          회원 탈퇴
        </div>

        <div className='mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5'>
          <p className='text-base font-semibold text-rose-700'>
            회원 탈퇴 시 주의사항
          </p>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-rose-600'>
            {WITHDRAWAL_WARNINGS.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>

        <Button
          type='button'
          variant='destructive'
          className='mt-5 w-full'
          disabled
        >
          회원 탈퇴 API 연동 예정
        </Button>
      </section>
    </article>
  );
}

function SectionCard({
  action,
  children,
  icon: Icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2 text-lg font-semibold text-slate-900'>
          <Icon className='h-5 w-5' />
          {title}
        </div>
        {action}
      </div>
      <div className='mt-6'>{children}</div>
    </section>
  );
}
