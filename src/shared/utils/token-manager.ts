import {
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
} from '@/shared/constants';

import { reissueTokenAPI } from '@/apis';

import { tokenStorage } from './storage';

/**
 * 토큰 재발급을 수행하는 공통 함수
 * @returns 성공 시 { success: true, accessToken: string }, 실패 시 { success: false }
 */
export async function executeTokenRefresh(): Promise<{
  success: boolean;
  accessToken?: string;
}> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return { success: false };
  }

  try {
    const response = await reissueTokenAPI({ refreshToken });

    if (response.isSuccess) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.result;

      // 새로운 토큰 저장
      tokenStorage.setAccessToken(newAccessToken, ACCESS_TOKEN_EXPIRE_MINUTES);
      tokenStorage.setRefreshToken(newRefreshToken, REFRESH_TOKEN_EXPIRE_DAYS);

      return { success: true, accessToken: newAccessToken };
    }

    return { success: false };
  } catch {
    return { success: false };
  }
}

// 전역 토큰 재발급 상태 관리
export class TokenRefreshManager {
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;

  public static async refresh(
    refreshFn: () => Promise<boolean>
  ): Promise<boolean> {
    // 이미 재발급 중이면 같은 Promise 반환
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // 재발급 시작
    this.isRefreshing = true;
    this.refreshPromise = refreshFn()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error('토큰 재발급 실패:', error);
        return false;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  public static isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  public static reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}
