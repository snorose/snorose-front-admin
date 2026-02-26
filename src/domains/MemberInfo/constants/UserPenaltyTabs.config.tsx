import type { PenaltyUserInfo } from '@/shared/types';

import { DemotionPenaltyTab, WarnPenaltyTab } from '@/domains/MemberInfo';

export const getPenaltyTabs = ({
  member,
  onApplied,
}: {
  member: PenaltyUserInfo;
  onApplied?: () => void;
}) => [
  {
    label: '경고 관리',
    value: 'warn',
    content: <WarnPenaltyTab member={member} onApplied={onApplied} />,
  },
  {
    label: '강등 관리',
    value: 'demotion',
    content: <DemotionPenaltyTab member={member} onApplied={onApplied} />,
  },
];
