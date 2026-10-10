export interface AdminStatusHistory {
  actorNickname: string | null;
  changedAt: string;
  changedStatus:
    | 'AUTO_HIDDEN'
    | 'USER_DELETED'
    | 'DELETE_RESTORED'
    | 'ADMIN_DELETED'
    | 'ADMIN_HIDDEN'
    | 'VISIBILITY_RESTORED'
    | 'SANCTIONED'
    | 'SANCTION_RELEASED';
  memo: string | null;
}
