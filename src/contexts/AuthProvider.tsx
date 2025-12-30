import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type JSX,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { AuthContext } from './AuthContext';
import type {
  User,
  LoginRequest,
  AuthContextType,
  ApiErrorResponse,
} from '@/types';
import {
  tokenStorage,
  TokenRefreshManager,
  executeTokenRefresh,
  userStorage,
} from '@/utils';
import {
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
  ADMIN_ROLE_ID,
} from '@/constants';
import { loginAPI } from '@/apis';

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initAttempted = useRef(false); // 초기화 시도 여부 플래그

  const rehydrateUser = useCallback(() => {
    const savedUser = userStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // 초기 인증 상태 확인 및 토큰 재발급
  useEffect(() => {
    // 이미 초기화를 시도했다면 실행하지 않음
    if (initAttempted.current) {
      return;
    }

    initAttempted.current = true;

    const initAuth = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      // accessToken이 있으면 이미 인증됨
      if (accessToken && refreshToken) {
        rehydrateUser();
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // accessToken은 없지만 refreshToken이 있으면 재발급 시도 (로딩 유지)
      if (!accessToken && refreshToken) {
        // TokenRefreshManager를 통해 중복 호출 방지
        const success = await TokenRefreshManager.refresh(async () => {
          const result = await executeTokenRefresh();
          return result.success;
        });

        if (success) {
          rehydrateUser();
          setIsAuthenticated(true);
        } else {
          tokenStorage.clearAll();
          userStorage.removeUser();
          setIsAuthenticated(false);
        }
        setIsLoading(false);
        return;
      }

      // refreshToken도 없으면 로그아웃 상태
      setIsLoading(false);
    };

    initAuth();
  }, [rehydrateUser]);

  // 로그인
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginAPI(credentials);

        if (response.isSuccess) {
          const { tokenResponse, ...userData } = response.result;

          if (userData.userRoleId !== ADMIN_ROLE_ID) {
            const errorMessage = '접근 권한이 없습니다.';

            userStorage.removeUser();
            setIsLoading(false);
            setError(errorMessage);

            return { success: false, error: errorMessage };
          }

          tokenStorage.setAccessToken(
            tokenResponse.accessToken,
            ACCESS_TOKEN_EXPIRE_MINUTES
          );
          tokenStorage.setRefreshToken(
            tokenResponse.refreshToken,
            REFRESH_TOKEN_EXPIRE_DAYS
          );

          // 사용자 정보 상태 업데이트
          setUser(userData);
          userStorage.setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);

          // 로그인 성공 시 리다이렉트
          navigate('/member/info');

          return { success: true };
        } else {
          throw new Error(response.message || '로그인에 실패했습니다.');
        }
      } catch (error: unknown) {
        const errorMessage =
          (isAxiosError<ApiErrorResponse>(error) &&
            error.response?.data?.message) ||
          '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';

        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setError(errorMessage);

        return { success: false, error: errorMessage };
      }
    },
    [navigate]
  );

  // 로그아웃
  const logout = useCallback(() => {
    tokenStorage.clearAll();
    userStorage.removeUser();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    navigate('/');
  }, [navigate]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
