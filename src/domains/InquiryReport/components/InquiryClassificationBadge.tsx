import { Badge } from '@/shared/components/ui';
import type { InquiryGroup, InquirySubGroup } from '@/shared/types';

import {
  INQUIRY_GROUP_LABELS,
  INQUIRY_SUB_GROUP_LABELS,
} from '@/domains/InquiryReport/constants/inquiryReportLabels';

const GROUP_BADGE_CLASS_NAMES: Record<InquiryGroup, string> = {
  INQUIRY: 'bg-blue-100 text-blue-800',
  REPORT: 'bg-red-100 text-red-800',
  ETC: 'bg-gray-100 text-gray-700',
};

const SUB_GROUP_BADGE_CLASS_NAMES: Record<
  Exclude<InquiryGroup, 'ETC'>,
  string
> = {
  INQUIRY: 'border-blue-100 bg-blue-50 text-blue-700',
  REPORT: 'border-red-100 bg-red-50 text-red-700',
};

function getSubGroupBadgeClassName(subGroup: InquirySubGroup) {
  const group = subGroup.endsWith('_REPORT') ? 'REPORT' : 'INQUIRY';
  return SUB_GROUP_BADGE_CLASS_NAMES[group];
}

interface InquiryGroupBadgeProps {
  group: InquiryGroup;
}

export function InquiryGroupBadge({ group }: InquiryGroupBadgeProps) {
  const label = INQUIRY_GROUP_LABELS[group] ?? group;

  return (
    <Badge
      variant='unstyled'
      className={`max-w-full truncate border-transparent ${GROUP_BADGE_CLASS_NAMES[group]}`}
      title={label}
    >
      {label}
    </Badge>
  );
}

interface InquirySubGroupBadgeProps {
  subGroup: InquirySubGroup;
}

export function InquirySubGroupBadge({ subGroup }: InquirySubGroupBadgeProps) {
  const label = INQUIRY_SUB_GROUP_LABELS[subGroup] ?? subGroup;

  return (
    <Badge
      variant='unstyled'
      className={`max-w-full truncate ${getSubGroupBadgeClassName(subGroup)}`}
      title={label}
    >
      {label}
    </Badge>
  );
}
