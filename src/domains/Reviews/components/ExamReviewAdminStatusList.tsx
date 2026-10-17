import { UserRoundIcon } from 'lucide-react';

import { Badge, Card } from '@/shared/components/ui';

import type { ExamReviewAdminStatusManager } from '@/domains/Reviews/types';

interface ExamReviewAdminStatusListProps {
  managers: ExamReviewAdminStatusManager[];
  averagePerAdmin: number;
}

export function ExamReviewAdminStatusList({
  managers,
  averagePerAdmin,
}: ExamReviewAdminStatusListProps) {
  const sortedManagers = [...managers].sort(
    (a, b) =>
      b.processedCount - a.processedCount ||
      (a.nickname ?? '').localeCompare(b.nickname ?? '', 'ko')
  );

  return (
    <Card className='bg-card flex min-h-[392px] min-w-0 flex-col'>
      <Card.Header className='flex-row flex-wrap items-start justify-between gap-4 px-6 pt-6'>
        <div className='flex flex-col gap-1.5'>
          <Card.Title>관리자별 처리 현황</Card.Title>
          <Card.Description>
            미확인 → 확인 변경 이력 기준입니다.
          </Card.Description>
        </div>
        <div className='bg-muted shrink-0 rounded-lg px-3 py-2 text-right'>
          <p className='text-muted-foreground text-xs'>1인당 평균</p>
          <p className='text-lg font-bold'>
            {managers.length === 0 ? '-' : `${averagePerAdmin}건`}
          </p>
        </div>
      </Card.Header>

      <Card.Content className='min-h-0 flex-1 overflow-hidden pt-5'>
        {managers.length === 0 ? (
          <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center text-sm'>
            <UserRoundIcon className='size-8 opacity-40' />
            <p>처리 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className='flex max-h-64 flex-col divide-y overflow-y-auto pr-1'>
            {sortedManagers.map((manager) => (
              <li
                key={manager.encryptedAdminId}
                className='flex shrink-0 items-center justify-between gap-4 py-3 first:pt-0'
              >
                <span
                  className='min-w-0 truncate text-sm font-medium'
                  title={manager.nickname ?? '닉네임 없음'}
                >
                  {manager.nickname ?? '닉네임 없음'}
                </span>
                <Badge variant='secondary' className='shrink-0 px-2.5 py-1'>
                  {manager.processedCount}건
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card.Content>
    </Card>
  );
}
