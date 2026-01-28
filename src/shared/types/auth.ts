export type LoginRequest = {
  loginId: string;
  password: string;
};

export type TokenResponse = {
  grantType: string;
  accessToken: string;
  refreshToken: string;
};

export type LoginResult = {
  tokenResponse: TokenResponse;
  userId: number;
  nickname: string;
  balance: number;
  userRoleId: number;
  birthday: string;
};

export type LoginResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: LoginResult;
};

export type ReissueTokenRequest = {
  refreshToken: string;
};

export type ReissueTokenResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: TokenResponse;
};

export type ApiErrorResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
};

export type User = {
  userId: number;
  nickname: string;
  balance: number;
  userRoleId: number;
  birthday: string;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    credentials: LoginRequest
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
};
