export type MemberInfo = {
  userId: number;
  loginId: string;
  userName: string;
  email: string;
  nickname: string;
  userRoleId: number;
  studentNumber: string;
  major: string;
  birthday: string; // YYYY-MM-DD
  balance: number;
  joinedAt: string; // YYYY-MM-DD
  upgradedAt: string; // YYYY-MM-DD
  warningCount: number;
  blacklistType: string | null;
  blacklistCreatedAt: string | null; // YYYY-MM-DDTHH:MM:SS
  blacklistDeadline: string | null; // YYYY-MM-DDTHH:MM:SS
};

export type DownloadedExamReview = {
  loginId: string;
  studentNumber: string;
  postId: number;
  title: string;
};

export type UserPointHistory = {
  loginId: string;
  studentNumber: string;
  sourceId: number;
  source: string;
  category: string;
  sourceDetail: string | null;
  difference: number;
  createAt: string; // YYYY-MM-DDTHH:MM:SS
  balance: number | null;
};

export type UserBlacklistHistory = {
  loginId: string;
  studentNumber: string;
  type: string;
  blackReason: string;
  createdAt: string; // YYYY-MM-DD HH:MM:SS
  blacklistDeadline: string | null; // YYYY-MM-DD HH:MM:SS
};
