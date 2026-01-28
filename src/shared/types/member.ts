export type MemberInfo = {
  encryptedUserId: string;
  loginId: string;
  userName: string;
  email: string;
  nickname: string;
  userRoleId: number;
  studentNumber: string;
  major: string;
  birthday: string; // YYYY-MM-DD
  pointBalance: number;
  createdAt: string; // YYYY-MM-DDTHH:MM:SS
  authenticatedAt: string | null; // YYYY-MM-DDTHH:MM:SS
  totalWarningCount: number;
  isBlacklist: string | null;
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
  encryptedUserId: string;
  studentNumber: string;
  type: string;
  blackReason: string;
  createdAt: string; // YYYY-MM-DD HH:MM:SS
  blacklistDeadline: string | null; // YYYY-MM-DD HH:MM:SS
};

export type PenaltyUserInfo = {
  loginId: string;
  encryptedUserId: string;
  userName: string;
  studentNumber: string;
  userRoleId: number;
  totalWarningCount: number;
  isBlacklist: string | null;
  blacklistStartDate: string | null; // YYYY-MM-DDTHH:MM:SS
  blacklistEndDate: string | null; // YYYY-MM-DDTHH:MM:SS
};

export interface EditMemberInfo {
  userName?: string;
  email?: string;
  studentNumber?: string;
  major?: string;
  birthday?: string; // YYYY-MM-DD
  userRoleId?: number;
  authenticatedAt?: string | null; // YYYY-MM-DDTHH:MM:SS
}

export interface UpdateUserInfoResponse {
  isSuccess: boolean;
  code: number;
  message: string;
}

export interface BlacklistHistoryItem {
  encryptedUserId: string;
  studentNumber: string;
  type: string;
  blackReason: string;
  createdAt: string;
  blacklistDeadline: string | null;
}
