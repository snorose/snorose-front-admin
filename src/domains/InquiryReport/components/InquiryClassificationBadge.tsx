import { StatusBadge } from '@/shared/components';
import type { InquiryGroup, InquirySubGroup } from '@/shared/types';

import {
  getInquiryGroupBadgeMeta,
  getInquirySubGroupBadgeMeta,
} from '@/domains/InquiryReport/constants/inquiryReportLabels';

interface InquiryGroupBadgeProps {
  group: InquiryGroup;
}

export function InquiryGroupBadge({ group }: InquiryGroupBadgeProps) {
  const badge = getInquiryGroupBadgeMeta(group);

  return (
    <span className='inline-flex max-w-full' title={badge.label}>
      <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
    </span>
  );
}

interface InquirySubGroupBadgeProps {
  subGroup: InquirySubGroup;
}

export function InquirySubGroupBadge({ subGroup }: InquirySubGroupBadgeProps) {
  const badge = getInquirySubGroupBadgeMeta(subGroup);

  return (
    <span className='inline-flex max-w-full' title={badge.label}>
      <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
    </span>
  );
}
