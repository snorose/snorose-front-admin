import type { StatusBadgeTone } from '@/shared/components';
import type { AdminStatusHistory } from '@/shared/types/status-history';

export const STATUS_HISTORY_META: Record<
  AdminStatusHistory['changedStatus'],
  { label: string; tone: StatusBadgeTone }
> = {
  AUTO_HIDDEN: { label: '신고로 자동 비공개', tone: 'warning' },
  USER_DELETED: { label: '사용자 삭제', tone: 'danger' },
  DELETE_RESTORED: { label: '삭제 복구', tone: 'neutral' },
  ADMIN_DELETED: { label: '어드민 삭제', tone: 'danger' },
  ADMIN_HIDDEN: { label: '어드민 비공개', tone: 'warning' },
  VISIBILITY_RESTORED: { label: '공개 복구', tone: 'neutral' },
  SANCTIONED: { label: '징계 처리', tone: 'accent' },
  SANCTION_RELEASED: { label: '징계 해제', tone: 'neutral' },
};

export const UNKNOWN_STATUS_HISTORY_META = {
  label: '알 수 없음',
  tone: 'neutral',
} as const satisfies { label: string; tone: StatusBadgeTone };
