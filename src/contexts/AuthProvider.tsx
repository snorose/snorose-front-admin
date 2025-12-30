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
import { AuthContext } from './AutoContext';
import type {
  User,
  LoginRequest,
  AuthContextType,
  ApiErrorResponse,
} from '@/types';
import { tokenStorage, TokenRefreshManager } from '@/utils';
import { loginAPI, reissueTokenAPI } from '@/apis';

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
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // accessToken은 없지만 refreshToken이 있으면 재발급 시도 (로딩 유지)
      if (!accessToken && refreshToken) {
        // TokenRefreshManager를 통해 중복 호출 방지
        const success = await TokenRefreshManager.refresh(async () => {
          try {
            const response = await reissueTokenAPI({ refreshToken });

            if (response.isSuccess) {
              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              } = response.result;

              // 새 토큰 저장
              tokenStorage.setAccessToken(newAccessToken, 15); // 15분
              tokenStorage.setRefreshToken(newRefreshToken, 7);

              return true;
            }
            return false;
          } catch {
            return false;
          }
        });

        if (success) {
          setIsAuthenticated(true);
        } else {
          // 토큰 재발급 실패 시 로그아웃
          tokenStorage.clearAll();
          setIsAuthenticated(false);
        }
        setIsLoading(false);
        return;
      }

      // refreshToken도 없으면 로그아웃 상태
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 로그인
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginAPI(credentials);

        if (response.isSuccess) {
          const { tokenResponse, ...userData } = response.result;

          tokenStorage.setAccessToken(tokenResponse.accessToken, 15); // 15분
          tokenStorage.setRefreshToken(tokenResponse.refreshToken, 7); // 7일

          // 사용자 정보 상태 업데이트
          setUser(userData);
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
