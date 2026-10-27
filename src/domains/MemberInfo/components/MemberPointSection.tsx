import { Coins, History } from 'lucide-react';

import { Button } from '@/shared/components/ui';

import { formatPoint } from '@/domains/MemberInfo/utils/memberDirectory';

type MemberPointSectionProps = {
  pointBalance: number;
  onPointAdjustmentOpen: () => void;
  onPointHistoryOpen: () => void;
};

export default function MemberPointSection({
  pointBalance,
  onPointAdjustmentOpen,
  onPointHistoryOpen,
}: MemberPointSectionProps) {
  return (
    <div className='border-border mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t pt-4'>
      <dl className='flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1'>
        <dt className='text-sm font-medium'>보유 포인트</dt>
        <dd className='min-w-0 text-sm font-semibold wrap-break-word tabular-nums'>
          {formatPoint(pointBalance)}
        </dd>
      </dl>
      <div className='flex flex-wrap items-center gap-1.5'>
        <Button
          type='button'
          variant='outline'
          onClick={onPointHistoryOpen}
          aria-label='포인트 이력 열기'
        >
          <History aria-hidden='true' />
          포인트 이력
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onPointAdjustmentOpen}
          aria-label='포인트 지급·차감'
        >
          <Coins aria-hidden='true' />
          지급·차감
        </Button>
      </div>
    </div>
  );
}
