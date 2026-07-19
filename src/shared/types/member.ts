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
  loginId?: string;
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
  adminLoginId?: string;
  adminId?: string;
  deletedAt?: string | null;
  deletedReason?: string | null;
  deletedBy?: string | null;
};

export type AdminUserListItem = {
  encryptedUserId: string;
  loginId: string;
  userName: string;
  nickname: string;
  email: string;
  studentNumber: string;
  major: string;
  userRoleId: number;
  userRoleName: string;
  pointBalance: number;
  createdAt: string; // YYYY-MM-DD
  authenticatedAt: string | null; // YYYY-MM-DD
};

export type AdminUserListResult = {
  hasNext: boolean;
  totalPage: number;
  totalCount: number;
  currentCount: number;
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

export type PenaltyUserInfo = {
  loginId: string;
  encryptedUserId: string;
  userName: string;
  studentNumber: string;
  userRoleId: number;
  totalWarningCount: number;
  isBlacklist: boolean | null;
  blacklistType?: string | null;
  blacklistStartDate: string | null; // YYYY-MM-DDTHH:MM:SS
  blacklistEndDate: string | null; // YYYY-MM-DDTHH:MM:SS
};

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
  id?: number;
  encryptedUserId: string;
  studentNumber: string;
  type: string;
  reasonType?: string;
  warningCount?: number;
  blackReason: string;
  createdAt: string;
  blacklistStartDate?: string | null;
  blacklistDeadline: string | null;
  adminId?: string;
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
