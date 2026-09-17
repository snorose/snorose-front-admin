import { UserRoundIcon } from 'lucide-react';

import { Badge, Card } from '@/shared/components/ui';

import type {
  ExamReviewAdminStatusManager,
  ExamReviewAdminStatusSummary,
} from '@/domains/Reviews/types';
import { getAverageProcessedCount } from '@/domains/Reviews/utils';

interface ExamReviewAdminStatusListProps {
  managers: ExamReviewAdminStatusManager[];
  summary: ExamReviewAdminStatusSummary;
}

export function ExamReviewAdminStatusList({
  managers,
  summary,
}: ExamReviewAdminStatusListProps) {
  const averageProcessedCount = getAverageProcessedCount(managers);

  return (
    <Card className='flex h-[392px] flex-col bg-white'>
      <Card.Header className='flex-row items-start justify-between gap-4 px-6 pt-6'>
        <div className='flex flex-col gap-1.5'>
          <Card.Title>관리자별 처리 현황</Card.Title>
          <Card.Description>
            현재 확인 완료 상태의 담당자를 표시합니다.
          </Card.Description>
        </div>
        <div className='bg-muted shrink-0 rounded-lg px-3 py-2 text-right'>
          <p className='text-muted-foreground text-xs'>1인당 평균</p>
          <p className='text-lg font-bold'>
            {averageProcessedCount === null
              ? '-'
              : `${averageProcessedCount}건`}
          </p>
        </div>
      </Card.Header>

      <Card.Content className='min-h-0 flex-1 overflow-hidden pt-5'>
        {managers.length === 0 && summary.unassignedCount === 0 ? (
          <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center text-sm'>
            <UserRoundIcon className='size-8 opacity-40' />
            <p>처리 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className='flex h-full flex-col divide-y overflow-y-auto pr-1'>
            {managers.map((manager) => (
              <li
                key={manager.encryptedAdminId}
                className='flex shrink-0 items-center justify-between gap-4 py-3 first:pt-0'
              >
                <span className='truncate text-sm font-medium'>
                  {manager.nickname}
                </span>
                <Badge variant='secondary' className='px-2.5 py-1'>
                  {manager.processedCount}건
                </Badge>
              </li>
            ))}

            {summary.unassignedCount > 0 && (
              <li className='flex shrink-0 items-center justify-between gap-4 py-3'>
                <span className='truncate text-sm font-medium'>
                  담당자 미상
                </span>
                <Badge variant='secondary' className='px-2.5 py-1'>
                  {summary.unassignedCount}건
                </Badge>
              </li>
            )}
          </ul>
        )}
      </Card.Content>
    </Card>
  );
}
