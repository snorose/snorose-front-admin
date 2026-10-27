import { Coins, History } from 'lucide-react';

import { Button } from '@/shared/components/ui';

import { SectionCard } from '@/domains/MemberInfo/components/MemberDetailCard';
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
    <SectionCard icon={Coins} title='보유 포인트'>
      <div className='flex min-w-0 flex-wrap items-center justify-between gap-3'>
        <p className='text-primary min-w-0 text-xl font-semibold wrap-break-word tabular-nums'>
          {formatPoint(pointBalance)}
        </p>
        <div className='ml-auto flex shrink-0 items-center gap-1.5'>
          <Button
            type='button'
            variant='outline'
            onClick={onPointHistoryOpen}
            aria-label='포인트 이력 열기'
          >
            <History aria-hidden='true' />
            이력
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
    </SectionCard>
  );
}
