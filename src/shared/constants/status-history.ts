import type { AdminStatusHistory } from '@/shared/types/status-history';

export const STATUS_HISTORY_LABELS: Record<
  AdminStatusHistory['changedStatus'],
  string
> = {
  AUTO_HIDDEN: '신고로 자동 비공개',
  USER_DELETED: '사용자 삭제',
  DELETE_RESTORED: '삭제 복구',
  ADMIN_DELETED: '관리자 삭제',
  ADMIN_HIDDEN: '관리자 비공개',
  VISIBILITY_RESTORED: '공개 복구',
  SANCTIONED: '징계 처리',
  SANCTION_RELEASED: '징계 해제',
};
