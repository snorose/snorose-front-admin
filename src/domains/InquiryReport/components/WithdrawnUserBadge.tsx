import { StatusBadge } from '@/shared/components';

import { INQUIRY_AUXILIARY_BADGE_META } from '@/domains/InquiryReport/constants/inquiryReportLabels';

export default function WithdrawnUserBadge() {
  const badge = INQUIRY_AUXILIARY_BADGE_META.WITHDRAWN;

  return <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>;
}
