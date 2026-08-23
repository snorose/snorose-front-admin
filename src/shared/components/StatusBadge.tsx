import type { ReactNode } from 'react';

import { Badge } from '@/shared/components/ui';

export type StatusBadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'outline';

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: ReactNode;
}

const STATUS_BADGE_TONES: Record<StatusBadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  danger: 'border-rose-100 bg-rose-50 text-rose-700',
  accent: 'border-violet-100 bg-violet-50 text-violet-700',
  outline: 'border-slate-200 bg-white text-slate-800',
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <Badge
      variant='unstyled'
      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE_TONES[tone]}`}
    >
      {children}
    </Badge>
  );
}
