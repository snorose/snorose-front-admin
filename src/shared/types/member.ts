export type MemberInfo = {
  encryptedUserId: string;
  loginId: string;
  userName: string;
  userRoleName?: string;
  email: string;
  nickname: string;
  profileImageUrl?: string | null;
  userRoleId: number;
  studentNumber: string;
  major: string;
  birthday: string; // YYYY-MM-DD
  pointBalance: number;
  createdAt: string; // YYYY-MM-DDTHH:MM:SS
  authenticatedAt: string | null; // YYYY-MM-DDTHH:MM:SS
  updatedAt?: string | null; // YYYY-MM-DDTHH:MM:SS
  lastLoginAt?: string | null; // YYYY-MM-DDTHH:MM:SS
  currentWarningCount?: number;
  totalWarningCount: number;
  isBlacklist: boolean | null;
  blacklistType?: string | null;
  blacklistReason?: string | null;
  blacklistStartDate: string | null; // YYYY-MM-DDTHH:MM:SS
  blacklistEndDate: string | null; // YYYY-MM-DDTHH:MM:SS
};

export type DownloadedExamReview = {
  encryptedUserId: string;
  studentNumber: string;
  postId: number;
  title: string;
};

export type UserPointHistory = {
  encryptedUserId: string;
  studentNumber: string;
  sourceId: number;
  source: string;
  category: string;
  sourceDetail: string | null;
  difference: number;
  createAt: string; // YYYY-MM-DDTHH:MM:SS
  pointBalance: number | null;
};

export type UserBlacklistHistory = {
  encryptedUserId?: string;
  studentNumber?: string;
  type: string;
  reasonType?: string;
  warningCount?: number;
  blackReason: string;
  memo?: string | null;
  createdAt: string; // YYYY-MM-DD HH:MM:SS
  blacklistStartDate?: string | null;
  blacklistDeadline: string | null; // YYYY-MM-DD HH:MM:SS
  adminName?: string | null;
  deletedAt?: string | null;
  deletedReason?: string | null;
  deletedBy?: string | null;
};

// 회원 목록 응답. MemberInfo의 부분집합이라 Pick으로 파생한다.
// (createdAt/authenticatedAt은 목록에선 YYYY-MM-DD로 내려온다)
export type AdminUserListItem = Pick<
  MemberInfo,
  | 'encryptedUserId'
  | 'loginId'
  | 'userName'
  | 'nickname'
  | 'email'
  | 'studentNumber'
  | 'major'
  | 'userRoleId'
  | 'pointBalance'
  | 'createdAt'
  | 'authenticatedAt'
> & {
  userRoleName: string; // 목록 응답에서는 항상 내려온다
};

export type AdminUserListResult = {
  hasNext: boolean;
  totalPage: number;
  totalCount: number;
  data: AdminUserListItem[];
};

export type AdminUserSortType =
  | 'CREATED_AT'
  | 'POINT_BALANCE'
  | 'AUTHENTICATED_AT';

export type SortDirection = 'ASC' | 'DESC';

export interface AdminUserListParams {
  page?: number;
  keyword?: string;
  userRoleId?: number;
  major?: string;
  admissionYear?: number;
  sortType?: AdminUserSortType;
  sortDirection?: SortDirection;
}

// 페널티 화면용 회원 정보. MemberInfo의 부분집합이라 Pick으로 파생한다.
export type PenaltyUserInfo = Pick<
  MemberInfo,
  | 'loginId'
  | 'encryptedUserId'
  | 'userName'
  | 'studentNumber'
  | 'userRoleId'
  | 'totalWarningCount'
  | 'isBlacklist'
  | 'blacklistType'
  | 'blacklistStartDate'
  | 'blacklistEndDate'
>;

export interface EditMemberInfo {
  userName?: string;
  nickname?: string;
  email?: string;
  studentNumber?: string;
  major?: string;
  birthday?: string; // YYYY-MM-DD
  userRoleId?: number;
}

export interface BlacklistHistoryItem {
  encryptedUserId: string;
  studentNumber: string;
  type: string;
  reasonType?: string;
  warningCount?: number;
  blackReason: string;
  createdAt: string;
  blacklistStartDate?: string | null;
  blacklistDeadline: string | null;
  adminName: string;
  operatorMemo?: string;
  deletedAt?: string | null;
  deletedReason?: string | null;
  deletedBy?: string | null;
}

export interface AdminBlacklistResult {
  hasNext: boolean;
  totalPage: number;
  totalCount: number;
  data: UserBlacklistHistory[];
}

export interface AdminBlacklistReq {
  encryptedUserId: string;
  type: 'WARNING' | 'RELEGATION' | 'BLACKLIST';
  reason: string;
  customReason?: string | null;
  warningCount?: number | null;
  relegationMonth?: number | null;
  memo?: string | null;
}
