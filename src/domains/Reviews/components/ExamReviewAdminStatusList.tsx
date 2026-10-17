import { useId } from 'react';

import type { ExamReviewAdminStatusManager } from '@/domains/Reviews/types';

import { ExamReviewAdminStatusInfoTooltip } from './ExamReviewAdminStatusInfoTooltip';

interface ExamReviewAdminStatusListProps {
  managers: ExamReviewAdminStatusManager[];
}

export function ExamReviewAdminStatusList({
  managers,
}: ExamReviewAdminStatusListProps) {
  const titleId = useId();
  const sortedManagers = [...managers].sort(
    (a, b) =>
      b.processedCount - a.processedCount ||
      (a.nickname ?? '').localeCompare(b.nickname ?? '', 'ko')
  );

  return (
    <section aria-labelledby={titleId} className='min-w-0'>
      <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
        <div className='flex items-center gap-1'>
          <h3 id={titleId} className='text-base font-semibold'>
            관리자별 처리 현황
          </h3>
          <ExamReviewAdminStatusInfoTooltip
            label='관리자별 처리 현황 설명'
            description='미확인 → 확인으로 변경한 횟수입니다.'
          />
        </div>
        <span className='text-muted-foreground text-xs tabular-nums'>
          {managers.length.toLocaleString('ko-KR')}명
        </span>
      </div>

      {managers.length === 0 ? (
        <div className='bg-muted/30 mt-2 rounded-lg border px-4 py-6 text-center'>
          <p className='text-sm font-medium'>처리 내역이 없습니다.</p>
          <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
            확인 처리 이력이 생기면 관리자별 건수가 표시됩니다.
          </p>
        </div>
      ) : (
        <div className='mt-2 overflow-hidden rounded-lg border'>
          <div className='bg-muted/40 text-muted-foreground flex items-center justify-between gap-4 border-b px-4 py-2.5 text-sm'>
            <span>관리자 닉네임</span>
            <span className='shrink-0'>처리 건수</span>
          </div>
          <ul
            aria-labelledby={titleId}
            className='max-h-80 divide-y overflow-y-auto overscroll-contain'
          >
            {sortedManagers.map((manager) => (
              <li
                key={manager.encryptedAdminId}
                className='flex items-start justify-between gap-4 px-4 py-3'
              >
                <span className='min-w-0 text-sm leading-5 font-medium [overflow-wrap:anywhere] break-words'>
                  {manager.nickname ?? '닉네임 없음'}
                </span>
                <span className='shrink-0 text-sm leading-5 font-medium tabular-nums'>
                  {manager.processedCount.toLocaleString('ko-KR')}건
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className='text-muted-foreground mt-2 text-xs leading-relaxed break-keep'>
        확인 처리 횟수는 현재 확인 완료 건수와 다를 수 있습니다.
      </p>
    </section>
  );
}
