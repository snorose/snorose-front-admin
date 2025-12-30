import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '@/utils';
import type { ReissueTokenResponse } from '@/types';
import {
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
} from '@/constants';

class AxiosInstanceManager {
  private static instance: AxiosInstance | null = null;
  private static isRefreshing = false;
  private static failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  private constructor() {}

  private static processQueue(
    error: Error | null = null,
    token: string | null = null
  ) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  public static getInstance(): AxiosInstance {
    if (!AxiosInstanceManager.instance) {
      AxiosInstanceManager.instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request Interceptor
      AxiosInstanceManager.instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          const accessToken = tokenStorage.getAccessToken();

          if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }

          return config;
        },
        (error: AxiosError) => {
          return Promise.reject(error);
        }
      );

      // Response Interceptor
      AxiosInstanceManager.instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
          };

          // 401 에러이고 재시도하지 않은 요청인 경우
          if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            originalRequest.url !== '/v1/users/reissueToken'
          ) {
            // 이미 토큰 재발급 중이면 대기열에 추가
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  if (originalRequest.headers && token) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  return AxiosInstanceManager.instance!(originalRequest);
                })
                .catch((err) => {
                  return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            this.isRefreshing = true;

            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
              // refreshToken이 없으면 로그아웃 처리
              this.isRefreshing = false;
              this.processQueue(new Error('No refresh token'), null);
              this.handleLogout();
              return Promise.reject(error);
            }

            try {
              // 토큰 재발급 API 호출
              const response = await axios.post<ReissueTokenResponse>(
                `${import.meta.env.VITE_API_BASE_URL}/v1/users/reissueToken`,
                { refreshToken }
              );

              if (response.data.isSuccess) {
                const { accessToken, refreshToken: newRefreshToken } =
                  response.data.result;

                // 새로운 토큰 저장
                tokenStorage.setAccessToken(
                  accessToken,
                  ACCESS_TOKEN_EXPIRE_MINUTES
                );
                tokenStorage.setRefreshToken(
                  newRefreshToken,
                  REFRESH_TOKEN_EXPIRE_DAYS
                );

                // 대기 중인 요청들에 새 토큰 전달
                this.processQueue(null, accessToken);

                // 원래 요청 재시도
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                this.isRefreshing = false;
                return AxiosInstanceManager.instance!(originalRequest);
              } else {
                throw new Error('토큰 재발급 실패');
              }
            } catch (refreshError) {
              // 토큰 재발급 실패 시 로그아웃 처리
              this.isRefreshing = false;
              const error =
                refreshError instanceof Error
                  ? refreshError
                  : new Error('토큰 재발급 실패');
              this.processQueue(error, null);
              this.handleLogout();
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );
    }

    return AxiosInstanceManager.instance;
  }

  private static handleLogout() {
    tokenStorage.clearAll();
    window.location.href = '/';
  }
}

export const axiosInstance = AxiosInstanceManager.getInstance();
