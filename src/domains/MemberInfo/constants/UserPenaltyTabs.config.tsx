import { WarnPenaltyTab, DemotionPenaltyTab } from '@/domains/MemberInfo';
import type { PenaltyUserInfo } from '@/types';

export const getPenaltyTabs = ({ member }: { member: PenaltyUserInfo }) => [
  {
    label: '경고 관리',
    value: 'warn',
    content: <WarnPenaltyTab member={member} />,
  },
  {
    label: '강등 관리',
    value: 'demotion',
    content: <DemotionPenaltyTab member={member} />,
  },
];
