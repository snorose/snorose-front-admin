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
